const Joi = require('joi');
const db = require('../db');

const taskSchema = Joi.object({
  projectId: Joi.number().integer().required(),
  title: Joi.string().min(2).max(200).required(),
  description: Joi.string().allow('', null),
  assigneeId: Joi.number().integer().allow(null),
  assigned_to: Joi.number().integer().allow(null),
  status: Joi.string().valid('todo', 'in_progress', 'blocked', 'done').default('todo'),
  priority: Joi.string().valid('low', 'medium', 'high').default('medium'),
  dueDate: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).allow(null),
  due_date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).allow(null),
  hasPublishDate: Joi.boolean().default(false), // Add this field
  publishDate: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).allow(null), // Add this field
});
// Add this deleteTask function
exports.deleteTask = async (req, res, next) => {
  const client = await db.pool.connect();
  try {
    const taskId = req.params.id;
    const userId = req.user.id;

    console.log(`Deleting task ${taskId} by user ${userId}`);

    await client.query('BEGIN');

    // First, check if the task exists and user has permission
    const taskCheck = await client.query(
      `
      SELECT t.*, p.manager_id, t.created_by_id
      FROM task t
      JOIN project p ON p.id = t.project_id
      WHERE t.id = $1
      `,
      [taskId]
    );

    if (taskCheck.rows.length === 0) {
      res.status(404);
      throw new Error('Task not found');
    }

    const task = taskCheck.rows[0];
    
    // Check if user has permission to delete (creator, assignee, or project manager)
    const canDelete = 
      task.created_by_id === userId || 
      task.assignee_id === userId || 
      task.manager_id === userId ||
      req.user.role === 'admin' || 
      req.user.role === 'manager';

    if (!canDelete) {
      res.status(403);
      throw new Error('You do not have permission to delete this task');
    }

    // Delete task comments first (if they exist)
    await client.query(
      `DELETE FROM task_comment WHERE task_id = $1`,
      [taskId]
    );

    // Delete timesheet entries for this task (if they exist)
    await client.query(
      `DELETE FROM timesheet_entry WHERE task_id = $1`,
      [taskId]
    );

    // Delete the task
    const deleteResult = await client.query(
      `DELETE FROM task WHERE id = $1 RETURNING *`,
      [taskId]
    );

    if (deleteResult.rows.length === 0) {
      res.status(404);
      throw new Error('Task not found');
    }

    await client.query('COMMIT');

    console.log(`Successfully deleted task ${taskId}`);
    res.json({ 
      message: 'Task deleted successfully',
      deletedTask: deleteResult.rows[0]
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error deleting task:', err);
    next(err);
  } finally {
    client.release();
  }
};

exports.getMyTasks = async (req, res, next) => {
  try {
    const result = await db.query(
      `
      SELECT t.*, p.name AS project_name
      FROM task t
      JOIN project p ON p.id = t.project_id
      WHERE t.assignee_id = $1
      ORDER BY t.due_date NULLS LAST, t.created_at DESC
      `,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

exports.getProjectTasks = async (req, res, next) => {
  try {
    const projectId = req.params.projectId;
    const result = await db.query(
      `
      SELECT t.*, ua.name AS assignee_name
      FROM task t
      LEFT JOIN user_account ua ON ua.id = t.assignee_id
      WHERE t.project_id = $1
      ORDER BY t.created_at DESC
      `,
      [projectId]
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};
exports.createTask = async (req, res, next) => {
  try {
    const { error, value } = taskSchema.validate(req.body);
    if (error) {
      res.status(400);
      return next(error);
    }

    const assigneeId = value.assigneeId || value.assigned_to;
    const dueDate = value.dueDate || value.due_date;
    const publishDate = value.publishDate;
    const hasPublishDate = value.hasPublishDate;
    const { projectId, title, description, status, priority } = value;

    const insert = await db.query(
      `
      INSERT INTO task
        (project_id, title, description, assignee_id, status, priority, due_date, has_publish_date, publish_date, created_by_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
      `,
      [projectId, title, description || null, assigneeId || null, status, priority, dueDate || null, hasPublishDate, publishDate || null, req.user.id]
    );
    res.status(201).json(insert.rows[0]);
  } catch (err) {
    next(err);
  }
};

exports.updateTask = async (req, res, next) => {
  try {
    const taskId = req.params.id;
    const { error, value } = taskSchema.fork(['projectId'], (field) => field.optional()).validate(req.body);
    if (error) {
      res.status(400);
      return next(error);
    }

    const assigneeId = value.assigneeId || value.assigned_to;
    const dueDate = value.dueDate || value.due_date;
    const publishDate = value.publishDate;
    const hasPublishDate = value.hasPublishDate;
    const { title, description, status, priority } = value;

    const result = await db.query(
      `
      UPDATE task
      SET
        title = COALESCE($2, title),
        description = COALESCE($3, description),
        assignee_id = COALESCE($4, assignee_id),
        status = COALESCE($5, status),
        priority = COALESCE($6, priority),
        due_date = COALESCE($7, due_date),
        has_publish_date = COALESCE($8, has_publish_date),
        publish_date = COALESCE($9, publish_date),
        updated_at = NOW()
      WHERE id = $1
      RETURNING *
      `,
      [taskId, title || null, description || null, assigneeId || null, status || null, priority || null, dueDate || null, hasPublishDate, publishDate || null]
    );

    if (result.rows.length === 0) {
      res.status(404);
      return next(new Error('Task not found'));
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

exports.addTaskComment = async (req, res, next) => {
  try {
    const taskId = req.params.id;
    const { text } = req.body;
    if (!text || !text.trim()) {
      res.status(400);
      return next(new Error('Comment text is required'));
    }

    const insert = await db.query(
      `
      INSERT INTO task_comment
        (task_id, author_id, body, created_at)
      VALUES ($1, $2, $3, NOW())
      RETURNING *
      `,
      [taskId, req.user.id, text.trim()]
    );

    res.status(201).json(insert.rows[0]);
  } catch (err) {
    next(err);
  }
};