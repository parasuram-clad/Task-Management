const Joi = require('joi');
const db = require('../db');

const projectSchema = Joi.object({
  name: Joi.string().min(2).max(200).required(),
  description: Joi.string().allow('', null),
  clientName: Joi.string().allow('', null),
  managerId: Joi.number().integer().required(),
  startDate: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).allow(null),
  endDate: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).allow(null),
});

const DEFAULT_COMPANY_ID = parseInt(process.env.DEFAULT_COMPANY_ID || '1', 10);

exports.listProjects = async (req, res, next) => {
  try {
    const result = await db.query(
      `
      SELECT p.*, ua.name AS manager_name
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
      return next(error);
    }

    const { name, description, clientName, managerId, startDate, endDate } = value;

    const insert = await db.query(
      `
      INSERT INTO project
        (company_id, name, description, client_name, manager_id, start_date, end_date, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'active')
      RETURNING *
      `,
      [DEFAULT_COMPANY_ID, name, description || null, clientName || null, managerId, startDate || null, endDate || null]
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
      SELECT pm.*, ua.name AS user_name, ua.email
      FROM project_member pm
      JOIN user_account ua ON ua.id = pm.user_id
      WHERE pm.project_id = $1
      ORDER BY ua.name
      `,
      [id]
    );

    const project = projRes.rows[0];
    project.members = membersRes.rows;
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
