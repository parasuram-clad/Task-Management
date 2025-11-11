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

exports.getMyWeekTimesheet = async (req, res, next) => {
  try {
    const { error, value } = weekQuerySchema.validate(req.query);
    if (error) {
      res.status(400);
      return next(error);
    }
    const { weekStartDate } = value;

    const tsRes = await db.query(
      `
      SELECT *
      FROM timesheet
      WHERE user_id = $1 AND week_start_date = $2
      LIMIT 1
      `,
      [req.user.id, weekStartDate]
    );

    if (tsRes.rows.length === 0) {
      return res.json({
        id: null,
        user_id: req.user.id,
        week_start_date: weekStartDate,
        status: 'draft',
        entries: [],
      });
    }

    const ts = tsRes.rows[0];
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

    ts.entries = entriesRes.rows;
    res.json(ts);
  } catch (err) {
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
    const result = await db.query(
      `
      SELECT ts.*, ua.name AS user_name, ua.email
      FROM timesheet ts
      JOIN user_account ua ON ua.id = ts.user_id
      WHERE ts.status = 'submitted'
      ORDER BY ts.week_start_date DESC
      `
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

exports.reviewTimesheet = async (req, res, next) => {
  try {
    const { action } = req.body; // 'approve' or 'reject'
    if (!['approve', 'reject'].includes(action)) {
      res.status(400);
      return next(new Error('Invalid action'));
    }

    const tsId = req.params.id;
    const status = action === 'approve' ? 'approved' : 'rejected';

    const result = await db.query(
      `
      UPDATE timesheet
      SET status = $1,
          approved_at = CASE WHEN $1 = 'approved' THEN NOW() ELSE NULL END,
          approved_by = CASE WHEN $1 = 'approved' THEN $2 ELSE NULL END
      WHERE id = $3 AND status = 'submitted'
      RETURNING *
      `,
      [status, req.user.id, tsId]
    );

    if (result.rows.length === 0) {
      res.status(400);
      return next(new Error('Timesheet not found or cannot be updated'));
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
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