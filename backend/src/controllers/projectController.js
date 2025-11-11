const Joi = require('joi');
const db = require('../db');

const projectSchema = Joi.object({
  name: Joi.string().min(2).max(200).required(),
  description: Joi.string().allow('', null),
  clientName: Joi.string().allow('', null),
  managerId: Joi.number().integer().required(),
  startDate: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required(),
  endDate: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required(),
  status: Joi.string().valid('active', 'on-hold', 'completed').default('active')
});

const DEFAULT_COMPANY_ID = parseInt(process.env.DEFAULT_COMPANY_ID || '1', 10);

exports.listProjects = async (req, res, next) => {
  try {
    const result = await db.query(
      `
      SELECT 
        p.*, 
        ua.name AS manager_name,
        (SELECT COUNT(*) FROM project_member pm WHERE pm.project_id = p.id) as member_count,
        (SELECT COUNT(*) FROM task t WHERE t.project_id = p.id) as total_tasks,
        (SELECT COUNT(*) FROM task t WHERE t.project_id = p.id AND t.status = 'done') as completed_tasks
      FROM project p
      JOIN user_account ua ON ua.id = p.manager_id
      WHERE p.company_id = $1
      ORDER BY p.created_at DESC
      `,
      [DEFAULT_COMPANY_ID]
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

exports.createProject = async (req, res, next) => {
  try {
    const { error, value } = projectSchema.validate(req.body);
    if (error) {
      res.status(400);
      return next(new Error(error.details[0].message));
    }

    const { name, description, clientName, managerId, startDate, endDate, status } = value;

    // Validate that manager exists in the company
    const managerCheck = await db.query(
      'SELECT id FROM user_account WHERE id = $1 AND company_id = $2',
      [managerId, DEFAULT_COMPANY_ID]
    );

    if (managerCheck.rows.length === 0) {
      res.status(400);
      return next(new Error('Selected manager is not a valid company user'));
    }

    const insert = await db.query(
      `
      INSERT INTO project
        (company_id, name, description, client_name, manager_id, start_date, end_date, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
      `,
      [DEFAULT_COMPANY_ID, name, description || null, clientName || null, managerId, startDate, endDate, status]
    );
    res.status(201).json(insert.rows[0]);
  } catch (err) {
    next(err);
  }
};

exports.getProjectById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const projRes = await db.query(
      `
      SELECT p.*, ua.name AS manager_name
      FROM project p
      JOIN user_account ua ON ua.id = p.manager_id
      WHERE p.id = $1 AND p.company_id = $2
      `,
      [id, DEFAULT_COMPANY_ID]
    );
    if (projRes.rows.length === 0) {
      res.status(404);
      return next(new Error('Project not found'));
    }

    const membersRes = await db.query(
      `
      SELECT pm.*, ua.name AS user_name, ua.email, ua.role
      FROM project_member pm
      JOIN user_account ua ON ua.id = pm.user_id
      WHERE pm.project_id = $1
      ORDER BY ua.name
      `,
      [id]
    );

    const tasksRes = await db.query(
      `
      SELECT t.*, ua.name AS assignee_name
      FROM task t
      LEFT JOIN user_account ua ON ua.id = t.assignee_id
      WHERE t.project_id = $1
      ORDER BY t.created_at DESC
      `,
      [id]
    );

    const project = projRes.rows[0];
    project.members = membersRes.rows;
    project.tasks = tasksRes.rows;
    res.json(project);
  } catch (err) {
    next(err);
  }
};

exports.addMemberToProject = async (req, res, next) => {
  try {
    const projectId = req.params.id;
    const { userId, roleLabel } = req.body;
    if (!userId) {
      res.status(400);
      return next(new Error('userId is required'));
    }

    const result = await db.query(
      `
      INSERT INTO project_member
        (project_id, user_id, role_label)
      VALUES ($1, $2, $3)
      ON CONFLICT (project_id, user_id)
      DO UPDATE SET role_label = EXCLUDED.role_label
      RETURNING *
      `,
      [projectId, userId, roleLabel || null]
    );
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

// New method to update project
exports.updateProject = async (req, res, next) => {
  try {
    const id = req.params.id;
    const { error, value } = projectSchema.validate(req.body);
    if (error) {
      res.status(400);
      return next(new Error(error.details[0].message));
    }

    const { name, description, clientName, managerId, startDate, endDate, status } = value;

    const update = await db.query(
      `
      UPDATE project 
      SET name = $1, description = $2, client_name = $3, manager_id = $4, 
          start_date = $5, end_date = $6, status = $7, updated_at = CURRENT_TIMESTAMP
      WHERE id = $8 AND company_id = $9
      RETURNING *
      `,
      [name, description || null, clientName || null, managerId, startDate, endDate, status, id, DEFAULT_COMPANY_ID]
    );

    if (update.rows.length === 0) {
      res.status(404);
      return next(new Error('Project not found'));
    }

    res.json(update.rows[0]);
  } catch (err) {
    next(err);
  }
};

// In projectController.js - This method already exists
exports.removeMemberFromProject = async (req, res, next) => {
  try {
    const projectId = req.params.id;
    const memberId = req.params.memberId;

    const result = await db.query(
      `
      DELETE FROM project_member
      WHERE project_id = $1 AND user_id = $2
      RETURNING *
      `,
      [projectId, memberId]
    );

    if (result.rows.length === 0) {
      res.status(404);
      return next(new Error('Project member not found'));
    }

    res.json({ message: 'Member removed from project successfully' });
  } catch (err) {
    next(err);
  }
};

exports.getEmployeeProjects = async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    
    const result = await db.query(
      `
      SELECT 
        p.*,
        pm.role_label,
        (SELECT SUM(hours) FROM timesheet_entry te 
         JOIN timesheet ts ON ts.id = te.timesheet_id 
         WHERE te.project_id = p.id AND ts.user_id = $1) as total_hours
      FROM project p
      JOIN project_member pm ON pm.project_id = p.id
      WHERE pm.user_id = $1
      ORDER BY p.created_at DESC
      `,
      [employeeId]
    );
    
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};