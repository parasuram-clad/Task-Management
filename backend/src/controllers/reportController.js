const db = require('../db');

exports.attendanceReport = async (req, res, next) => {
  try {
    const { userId, startDate, endDate } = req.query;
    const params = [];
    let where = 'WHERE 1=1';

    if (userId) {
      params.push(userId);
      where += ` AND a.user_id = $${params.length}`;
    }
    if (startDate) {
      params.push(startDate);
      where += ` AND a.work_date >= $${params.length}`;
    }
    if (endDate) {
      params.push(endDate);
      where += ` AND a.work_date <= $${params.length}`;
    }

    const result = await db.query(
      `
      SELECT a.*, ua.name AS user_name, ua.email
      FROM attendance a
      JOIN user_account ua ON ua.id = a.user_id
      ${where}
      ORDER BY a.work_date DESC
      `,
      params
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

exports.timesheetReport = async (req, res, next) => {
  try {
    const { userId, startDate, endDate } = req.query;
    const params = [];
    let where = 'WHERE 1=1';

    if (userId) {
      params.push(userId);
      where += ` AND ts.user_id = $${params.length}`;
    }
    if (startDate) {
      params.push(startDate);
      where += ` AND te.work_date >= $${params.length}`;
    }
    if (endDate) {
      params.push(endDate);
      where += ` AND te.work_date <= $${params.length}`;
    }

    const result = await db.query(
      `
      SELECT ts.id AS timesheet_id,
             ts.user_id,
             ua.name AS user_name,
             te.work_date,
             te.hours,
             te.note,
             p.name AS project_name,
             t.title AS task_title
      FROM timesheet ts
      JOIN user_account ua ON ua.id = ts.user_id
      JOIN timesheet_entry te ON te.timesheet_id = ts.id
      JOIN project p ON p.id = te.project_id
      LEFT JOIN task t ON t.id = te.task_id
      ${where}
      ORDER BY te.work_date DESC
      `,
      params
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};
