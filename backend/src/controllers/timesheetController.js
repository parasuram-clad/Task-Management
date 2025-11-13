const Joi = require('joi');
const db = require('../db');

// Update entrySchema to accept both projectId and project_id
const entrySchema = Joi.object({
  projectId: Joi.number().integer().required(),
  project_id: Joi.number().integer().optional(), // Add support for project_id
  taskId: Joi.number().integer().optional().allow(null),
  task_id: Joi.number().integer().optional().allow(null), // Add support for task_id
  workDate: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required(),
  work_date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).optional(), // Add support for work_date
  hours: Joi.number().min(0).max(24).required(),
  note: Joi.string().max(500).allow('', null),
});

const timesheetSaveSchema = Joi.object({
  weekStartDate: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required(),
  week_start_date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).optional(), // Add support for week_start_date
  entries: Joi.array().items(entrySchema).required(),
});

const weekQuerySchema = Joi.object({
  weekStartDate: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required(),
});



// In timesheetController.js - Update getMyWeekTimesheet
exports.getMyWeekTimesheet = async (req, res, next) => {
  try {
    const { error, value } = weekQuerySchema.validate(req.query);
    if (error) {
      console.log('Validation error:', error.details);
      res.status(400);
      return next(error);
    }
    const { weekStartDate } = value;

    console.log(`Fetching timesheet for user ${req.user.id}, week: ${weekStartDate}`);

    const tsRes = await db.query(
      `
      SELECT 
        ts.*,
        approver.name AS approver_name,
        rejector.name AS rejector_name
      FROM timesheet ts
      LEFT JOIN user_account approver ON approver.id = ts.approved_by
      LEFT JOIN user_account rejector ON rejector.id = ts.rejected_by
      WHERE ts.user_id = $1 AND ts.week_start_date = $2
      LIMIT 1
      `,
      [req.user.id, weekStartDate]
    );

    if (tsRes.rows.length === 0) {
      console.log('No timesheet found, returning empty draft');
      return res.json({
        id: null,
        user_id: req.user.id,
        week_start_date: weekStartDate,
        status: 'draft',
        entries: [],
        total_hours: 0
      });
    }

    const ts = tsRes.rows[0];
    console.log(`Found timesheet ID: ${ts.id}`);

    const entriesRes = await db.query(
      `
      SELECT te.*, p.name AS project_name, t.title AS task_title
      FROM timesheet_entry te
      JOIN project p ON p.id = te.project_id
      LEFT JOIN task t ON t.id = te.task_id
      WHERE te.timesheet_id = $1
      ORDER BY te.work_date, te.id
      `,
      [ts.id]
    );

    console.log(`Found ${entriesRes.rows.length} entries for timesheet ${ts.id}`);
    
    ts.entries = entriesRes.rows;
    
    // Calculate total hours
    ts.total_hours = entriesRes.rows.reduce((sum, entry) => sum + (parseFloat(entry.hours) || 0), 0);
    
    res.json(ts);
  } catch (err) {
    console.error('Error in getMyWeekTimesheet:', err);
    next(err);
  }
};
exports.saveMyWeekTimesheet = async (req, res, next) => {
  const client = await db.pool.connect();
  try {
    const { error, value } = timesheetSaveSchema.validate(req.body);
    if (error) {
      res.status(400);
      return next(error);
    }

    // Handle both weekStartDate and week_start_date
    const weekStartDate = value.weekStartDate || value.week_start_date;
    const entries = value.entries;

    await client.query('BEGIN');

    const tsRes = await client.query(
      `
      SELECT id, status
      FROM timesheet
      WHERE user_id = $1 AND week_start_date = $2
      FOR UPDATE
      `,
      [req.user.id, weekStartDate]
    );

    let tsId;
    if (tsRes.rows.length === 0) {
      const insertTs = await client.query(
        `
        INSERT INTO timesheet
          (user_id, week_start_date, status)
        VALUES ($1, $2, 'draft')
        RETURNING id, status
        `,
        [req.user.id, weekStartDate]
      );
      tsId = insertTs.rows[0].id;
    } else {
      const current = tsRes.rows[0];
      if (current.status === 'approved') {
        throw new Error('Cannot modify approved timesheet');
      }
      tsId = current.id;
      await client.query(
        `UPDATE timesheet SET status = 'draft' WHERE id = $1 AND status = 'rejected'`,
        [tsId]
      );
      await client.query(
        `DELETE FROM timesheet_entry WHERE timesheet_id = $1`,
        [tsId]
      );
    }

    for (const entry of entries) {
      // Handle both projectId and project_id
      const projectId = entry.projectId || entry.project_id;
      // Handle both taskId and task_id
      const taskId = entry.taskId || entry.task_id;
      // Handle both workDate and work_date
      const workDate = entry.workDate || entry.work_date;

      if (!projectId) {
        throw new Error('Project ID is required for timesheet entry');
      }

      // Validate that the project exists and user has access
      const projectCheck = await client.query(
        `SELECT id FROM project WHERE id = $1`,
        [projectId]
      );

      if (projectCheck.rows.length === 0) {
        throw new Error(`Project with ID ${projectId} not found`);
      }

      // If taskId is provided, validate it belongs to the project
      if (taskId) {
        const taskCheck = await client.query(
          `SELECT id FROM task WHERE id = $1 AND project_id = $2`,
          [taskId, projectId]
        );

        if (taskCheck.rows.length === 0) {
          throw new Error(`Task with ID ${taskId} not found in project ${projectId}`);
        }
      }

      await client.query(
        `
        INSERT INTO timesheet_entry
          (timesheet_id, project_id, task_id, work_date, hours, note)
        VALUES ($1, $2, $3, $4, $5, $6)
        `,
        [
          tsId,
          projectId,
          taskId || null,
          workDate,
          entry.hours,
          entry.note || null,
        ]
      );
    }

    await client.query('COMMIT');

    // Fetch the complete updated timesheet
    const tsFinal = await client.query(
      `
      SELECT *
      FROM timesheet
      WHERE id = $1
      `,
      [tsId]
    );
    const entriesFinal = await client.query(
      `
      SELECT te.*, p.name AS project_name, t.title AS task_title
      FROM timesheet_entry te
      JOIN project p ON p.id = te.project_id
      LEFT JOIN task t ON t.id = te.task_id
      WHERE te.timesheet_id = $1
      ORDER BY te.work_date, te.id
      `,
      [tsId]
    );
    const result = tsFinal.rows[0];
    result.entries = entriesFinal.rows;
    res.json(result);
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

exports.submitMyWeekTimesheet = async (req, res, next) => {
  try {
    const { error, value } = weekQuerySchema.validate(req.body);
    if (error) {
      res.status(400);
      return next(error);
    }
    const { weekStartDate } = value;

    const result = await db.query(
      `
      UPDATE timesheet
      SET status = 'submitted', submitted_at = NOW()
      WHERE user_id = $1 AND week_start_date = $2 AND status IN ('draft', 'rejected')
      RETURNING *
      `,
      [req.user.id, weekStartDate]
    );

    if (result.rows.length === 0) {
      res.status(400);
      return next(new Error('Timesheet not found or cannot be submitted'));
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

exports.getTimesheetsForApproval = async (req, res, next) => {
  try {
    // Get all timesheets with different statuses
    const timesheetsResult = await db.query(
      `
      SELECT 
        ts.*, 
        ua.name AS user_name, 
        ua.email,
        ua.employee_code,
        approver.name AS approver_name,
        rejector.name AS rejector_name
      FROM timesheet ts
      JOIN user_account ua ON ua.id = ts.user_id
      LEFT JOIN user_account approver ON approver.id = ts.approved_by
      LEFT JOIN user_account rejector ON rejector.id = ts.rejected_by
      WHERE ts.status IN ('submitted', 'approved', 'rejected')
      ORDER BY 
        CASE 
          WHEN ts.status = 'submitted' THEN 1
          WHEN ts.status = 'approved' THEN 2
          WHEN ts.status = 'rejected' THEN 3
        END,
        ts.week_start_date DESC
      `
    );

    // For each timesheet, get its entries
    const timesheetsWithEntries = await Promise.all(
      timesheetsResult.rows.map(async (timesheet) => {
        const entriesResult = await db.query(
          `
          SELECT 
            te.*, 
            p.name AS project_name, 
            t.title AS task_title
          FROM timesheet_entry te
          LEFT JOIN project p ON p.id = te.project_id
          LEFT JOIN task t ON t.id = te.task_id
          WHERE te.timesheet_id = $1
          ORDER BY te.work_date, te.id
          `,
          [timesheet.id]
        );

        return {
          ...timesheet,
          entries: entriesResult.rows
        };
      })
    );

    res.json(timesheetsWithEntries);
  } catch (err) {
    next(err);
  }
};

exports.reviewTimesheet = async (req, res, next) => {
  const client = await db.pool.connect();
  try {
    const { action, comment } = req.body; // 'approve' or 'reject'
    if (!['approve', 'reject'].includes(action)) {
      res.status(400);
      return next(new Error('Invalid action'));
    }

    const tsId = req.params.id;
    const status = action === 'approve' ? 'approved' : 'rejected';

    console.log(`Reviewing timesheet ${tsId}, action: ${action}, status: ${status}`);

    await client.query('BEGIN');

    // First check if timesheet exists and is in submitted status
    const timesheetCheck = await client.query(
      `SELECT id, status FROM timesheet WHERE id = $1 AND status = 'submitted'`,
      [tsId]
    );

    if (timesheetCheck.rows.length === 0) {
      res.status(400);
      throw new Error('Timesheet not found or cannot be updated (must be in submitted status)');
    }

    // Convert req.user.id to integer to ensure it's a number
    const userId = parseInt(req.user.id);
    if (isNaN(userId)) {
      throw new Error('Invalid user ID');
    }

    // Use separate queries for approve and reject to avoid type casting issues
    let result;
    if (action === 'approve') {
      result = await client.query(
        `
        UPDATE timesheet
        SET status = 'approved'::timesheet_status_enum,
            approved_at = NOW(),
            approved_by = $1,
            rejected_at = NULL,
            rejected_by = NULL,
            rejection_reason = NULL
        WHERE id = $2 AND status = 'submitted'
        RETURNING *
        `,
        [userId, tsId]
      );
    } else {
      result = await client.query(
        `
        UPDATE timesheet
        SET status = 'rejected'::timesheet_status_enum,
            approved_at = NULL,
            approved_by = NULL,
            rejected_at = NOW(),
            rejected_by = $1,
            rejection_reason = $2
        WHERE id = $3 AND status = 'submitted'
        RETURNING *
        `,
        [userId, comment || null, tsId]
      );
    }

    if (result.rows.length === 0) {
      res.status(400);
      throw new Error('Timesheet not found or cannot be updated');
    }

    await client.query('COMMIT');

    console.log(`Successfully ${action}d timesheet ${tsId}`);
    res.json(result.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error reviewing timesheet:', err);
    next(err);
  } finally {
    client.release();
  }
};
exports.saveMyWeekTimesheet = async (req, res, next) => {
  const client = await db.pool.connect();
  try {
    console.log('Received timesheet save request:', JSON.stringify(req.body, null, 2));
    
    const { error, value } = timesheetSaveSchema.validate(req.body);
    if (error) {
      console.log('Validation error:', error.details);
      res.status(400);
      return next(error);
    }

    // Handle both weekStartDate and week_start_date
    const weekStartDate = value.weekStartDate || value.week_start_date;
    const entries = value.entries;

    console.log('Processing entries:', entries);

    await client.query('BEGIN');

    const tsRes = await client.query(
      `
      SELECT id, status
      FROM timesheet
      WHERE user_id = $1 AND week_start_date = $2
      FOR UPDATE
      `,
      [req.user.id, weekStartDate]
    );

    let tsId;
    if (tsRes.rows.length === 0) {
      const insertTs = await client.query(
        `
        INSERT INTO timesheet
          (user_id, week_start_date, status)
        VALUES ($1, $2, 'draft')
        RETURNING id, status
        `,
        [req.user.id, weekStartDate]
      );
      tsId = insertTs.rows[0].id;
    } else {
      const current = tsRes.rows[0];
      if (current.status === 'approved') {
        throw new Error('Cannot modify approved timesheet');
      }
      tsId = current.id;
      await client.query(
        `UPDATE timesheet SET status = 'draft' WHERE id = $1 AND status = 'rejected'`,
        [tsId]
      );
      await client.query(
        `DELETE FROM timesheet_entry WHERE timesheet_id = $1`,
        [tsId]
      );
    }

    for (const entry of entries) {
      // Handle both projectId and project_id
      const projectId = entry.projectId || entry.project_id;
      // Handle both taskId and task_id
      const taskId = entry.taskId || entry.task_id;
      // Handle both workDate and work_date
      const workDate = entry.workDate || entry.work_date;

      console.log('Processing entry:', { projectId, taskId, workDate, hours: entry.hours });

      if (!projectId) {
        throw new Error('Project ID is required for timesheet entry');
      }

      // Validate that the project exists and user has access
      const projectCheck = await client.query(
        `SELECT id FROM project WHERE id = $1`,
        [projectId]
      );

      if (projectCheck.rows.length === 0) {
        throw new Error(`Project with ID ${projectId} not found`);
      }

      // If taskId is provided, validate it belongs to the project
      if (taskId) {
        const taskCheck = await client.query(
          `SELECT id FROM task WHERE id = $1 AND project_id = $2`,
          [taskId, projectId]
        );

        if (taskCheck.rows.length === 0) {
          throw new Error(`Task with ID ${taskId} not found in project ${projectId}`);
        }
      }

      await client.query(
        `
        INSERT INTO timesheet_entry
          (timesheet_id, project_id, task_id, work_date, hours, note)
        VALUES ($1, $2, $3, $4, $5, $6)
        `,
        [
          tsId,
          projectId,
          taskId || null,
          workDate,
          entry.hours,
          entry.note || null,
        ]
      );
    }

    await client.query('COMMIT');

    // Fetch the complete updated timesheet
    const tsFinal = await client.query(
      `
      SELECT *
      FROM timesheet
      WHERE id = $1
      `,
      [tsId]
    );
    const entriesFinal = await client.query(
      `
      SELECT te.*, p.name AS project_name, t.title AS task_title
      FROM timesheet_entry te
      JOIN project p ON p.id = te.project_id
      LEFT JOIN task t ON t.id = te.task_id
      WHERE te.timesheet_id = $1
      ORDER BY te.work_date, te.id
      `,
      [tsId]
    );
    const result = tsFinal.rows[0];
    result.entries = entriesFinal.rows;
    
    console.log('Timesheet saved successfully:', result.id);
    res.json(result);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error saving timesheet:', err);
    next(err);
  } finally {
    client.release();
  }
};

// Add this function to timesheetController.js
exports.getTimeLogsByTask = async (req, res, next) => {
  try {
    const taskId = req.params.taskId;
    const userId = req.user.id;
    
    console.log(`Fetching time logs for task ${taskId} and user ${userId}`);
    
    const result = await db.query(
      `
      SELECT 
        te.*, 
        p.name AS project_name, 
        t.title AS task_title,
        ts.week_start_date,
        ts.status as timesheet_status
      FROM timesheet_entry te
      JOIN timesheet ts ON ts.id = te.timesheet_id
      JOIN project p ON p.id = te.project_id
      LEFT JOIN task t ON t.id = te.task_id
      WHERE te.task_id = $1 AND ts.user_id = $2
      ORDER BY te.work_date DESC, te.id DESC
      `,
      [taskId, userId]
    );

    console.log(`Found ${result.rows.length} time logs for task ${taskId} and user ${userId}`);
    
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching time logs by task:', err);
    next(err);
  }
};

// Add this function to timesheetController.js
exports.deleteTimesheetEntry = async (req, res, next) => {
  const client = await db.pool.connect();
  try {
    const entryId = req.params.entryId;
    const userId = req.user.id;

    console.log(`Deleting timesheet entry ${entryId} for user ${userId}`);

    await client.query('BEGIN');

    // First, verify that the entry belongs to the user's timesheet
    const entryCheck = await client.query(
      `
      SELECT te.id, ts.user_id, ts.status
      FROM timesheet_entry te
      JOIN timesheet ts ON ts.id = te.timesheet_id
      WHERE te.id = $1 AND ts.user_id = $2
      `,
      [entryId, userId]
    );

    if (entryCheck.rows.length === 0) {
      res.status(404);
      throw new Error('Timesheet entry not found or you do not have permission to delete it');
    }

    const entry = entryCheck.rows[0];
    
    // Check if timesheet is approved (cannot modify approved timesheets)
    if (entry.status === 'approved') {
      res.status(400);
      throw new Error('Cannot delete entry from an approved timesheet');
    }

    // Delete the entry
    await client.query(
      `DELETE FROM timesheet_entry WHERE id = $1`,
      [entryId]
    );

    await client.query('COMMIT');

    console.log(`Successfully deleted timesheet entry ${entryId}`);
    res.json({ 
      message: 'Timesheet entry deleted successfully',
      deletedEntryId: entryId 
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error deleting timesheet entry:', err);
    next(err);
  } finally {
    client.release();
  }
};

exports.getEmployeeTimesheets = async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    
    const result = await db.query(
      `
      SELECT 
        ts.*,
        (SELECT SUM(hours) FROM timesheet_entry WHERE timesheet_id = ts.id) as total_hours
      FROM timesheet ts
      WHERE ts.user_id = $1
      ORDER BY ts.week_start_date DESC
      `,
      [employeeId]
    );
    
    // Get entries for each timesheet with task information
    const timesheetsWithEntries = await Promise.all(
      result.rows.map(async (timesheet) => {
        const entries = await db.query(
          `
          SELECT 
            te.*, 
            p.name as project_name,
            t.title as task_title  -- Add task_title here
          FROM timesheet_entry te
          JOIN project p ON p.id = te.project_id
          LEFT JOIN task t ON t.id = te.task_id  -- Use LEFT JOIN for optional task
          WHERE te.timesheet_id = $1
          ORDER BY te.work_date
          `,
          [timesheet.id]
        );
        
        return {
          ...timesheet,
          entries: entries.rows
        };
      })
    );
    
    res.json(timesheetsWithEntries);
  } catch (err) {
    next(err);
  }
};



// Get user's projects for timesheet (only assigned projects)
exports.getMyProjectsForTimesheet = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    console.log(`Fetching projects for user ${userId} for timesheet`);
    
    const result = await db.query(
      `
      SELECT DISTINCT 
        p.id,
        p.name,
        p.status as project_status
      FROM project p
      INNER JOIN project_member pm ON pm.project_id = p.id
      WHERE pm.user_id = $1 
        AND p.status = 'active'
      ORDER BY p.name
      `,
      [userId]
    );
    
    console.log(`Found ${result.rows.length} projects for user ${userId}`);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching user projects for timesheet:', err);
    next(err);
  }
};

// Get user's tasks for a specific project (only assigned tasks)
exports.getMyTasksForProject = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const projectId = req.params.projectId;
    
    console.log(`Fetching tasks for user ${userId} in project ${projectId}`);
    
    const result = await db.query(
      `
      SELECT 
        t.id,
        t.title,
        t.status,
        t.priority,
        t.due_date
      FROM task t
      WHERE t.project_id = $1 
        AND (t.assignee_id = $2 OR t.assignee_id IS NULL)
        AND t.status != 'done'
      ORDER BY t.title
      `,
      [projectId, userId]
    );
    
    console.log(`Found ${result.rows.length} tasks for user ${userId} in project ${projectId}`);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching user tasks for project:', err);
    next(err);
  }
};

// Get user's timesheet entries for a specific date
exports.getMyEntriesForDate = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const date = req.params.date;
    
    console.log(`Fetching timesheet entries for user ${userId} on date ${date}`);
    
    const result = await db.query(
      `
      SELECT 
        te.*,
        p.name as project_name,
        t.title as task_title,
        ts.week_start_date,
        ts.status as timesheet_status
      FROM timesheet_entry te
      JOIN timesheet ts ON ts.id = te.timesheet_id
      JOIN project p ON p.id = te.project_id
      LEFT JOIN task t ON t.id = te.task_id
      WHERE ts.user_id = $1 
        AND te.work_date = $2
      ORDER BY te.created_at DESC
      `,
      [userId, date]
    );
    
    console.log(`Found ${result.rows.length} entries for user ${userId} on date ${date}`);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching user entries for date:', err);
    next(err);
  }
};

// Enhanced save method with better validation
exports.saveMyWeekTimesheet = async (req, res, next) => {
  const client = await db.pool.connect();
  try {
    console.log('Received timesheet save request:', JSON.stringify(req.body, null, 2));
    
    const { error, value } = timesheetSaveSchema.validate(req.body);
    if (error) {
      console.log('Validation error:', error.details);
      res.status(400);
      return next(error);
    }

    const weekStartDate = value.weekStartDate || value.week_start_date;
    const entries = value.entries;
    const userId = req.user.id;

    console.log('Processing entries for user:', userId, entries);

    await client.query('BEGIN');

    // Validate user has access to all projects and tasks
    for (const entry of entries) {
      const projectId = entry.projectId || entry.project_id;
      const taskId = entry.taskId || entry.task_id;

      // Check if user has access to the project
      const projectAccess = await client.query(
        `
        SELECT 1 FROM project_member 
        WHERE project_id = $1 AND user_id = $2
        `,
        [projectId, userId]
      );

      if (projectAccess.rows.length === 0) {
        throw new Error(`You don't have access to project ${projectId}`);
      }

      // If task is specified, validate it belongs to the project and user
      if (taskId) {
        const taskAccess = await client.query(
          `
          SELECT 1 FROM task 
          WHERE id = $1 AND project_id = $2 
          AND (assignee_id = $3 OR assignee_id IS NULL)
          `,
          [taskId, projectId, userId]
        );

        if (taskAccess.rows.length === 0) {
          throw new Error(`Task ${taskId} not found or you are not assigned to it`);
        }
      }
    }

    // Continue with existing save logic...
    const tsRes = await client.query(
      `
      SELECT id, status
      FROM timesheet
      WHERE user_id = $1 AND week_start_date = $2
      FOR UPDATE
      `,
      [userId, weekStartDate]
    );

    let tsId;
    if (tsRes.rows.length === 0) {
      const insertTs = await client.query(
        `
        INSERT INTO timesheet
          (user_id, week_start_date, status)
        VALUES ($1, $2, 'draft')
        RETURNING id, status
        `,
        [userId, weekStartDate]
      );
      tsId = insertTs.rows[0].id;
    } else {
      const current = tsRes.rows[0];
      if (current.status === 'approved') {
        throw new Error('Cannot modify approved timesheet');
      }
      tsId = current.id;
      await client.query(
        `UPDATE timesheet SET status = 'draft' WHERE id = $1 AND status = 'rejected'`,
        [tsId]
      );
      await client.query(
        `DELETE FROM timesheet_entry WHERE timesheet_id = $1`,
        [tsId]
      );
    }

    for (const entry of entries) {
      const projectId = entry.projectId || entry.project_id;
      const taskId = entry.taskId || entry.task_id;
      const workDate = entry.workDate || entry.work_date;

      console.log('Processing entry:', { projectId, taskId, workDate, hours: entry.hours });

      if (!projectId) {
        throw new Error('Project ID is required for timesheet entry');
      }

      await client.query(
        `
        INSERT INTO timesheet_entry
          (timesheet_id, project_id, task_id, work_date, hours, note)
        VALUES ($1, $2, $3, $4, $5, $6)
        `,
        [
          tsId,
          projectId,
          taskId || null,
          workDate,
          entry.hours,
          entry.note || null,
        ]
      );
    }

    await client.query('COMMIT');

    // Fetch the complete updated timesheet
    const tsFinal = await client.query(
      `
      SELECT *
      FROM timesheet
      WHERE id = $1
      `,
      [tsId]
    );
    const entriesFinal = await client.query(
      `
      SELECT te.*, p.name AS project_name, t.title AS task_title
      FROM timesheet_entry te
      JOIN project p ON p.id = te.project_id
      LEFT JOIN task t ON t.id = te.task_id
      WHERE te.timesheet_id = $1
      ORDER BY te.work_date, te.id
      `,
      [tsId]
    );
    const result = tsFinal.rows[0];
    result.entries = entriesFinal.rows;
    
    console.log('Timesheet saved successfully:', result.id);
    res.json(result);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error saving timesheet:', err);
    next(err);
  } finally {
    client.release();
  }
};