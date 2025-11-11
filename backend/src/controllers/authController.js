const jwt = require('jsonwebtoken');
const Joi = require('joi');
const bcrypt = require('bcryptjs');
const db = require('../db');

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(64).required(),
  role: Joi.string().valid('employee', 'manager', 'hr', 'admin', 'finance').default('employee'),
  employeeCode: Joi.string().optional(),
});

const DEFAULT_COMPANY_ID = parseInt(process.env.DEFAULT_COMPANY_ID || '1', 10);

const generateAccessToken = (user) =>
  jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m' }
  );

const generateRefreshToken = (user) =>
  jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d' }
  );

exports.login = async (req, res, next) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      res.status(400);
      return next(error);
    }

    const { email, password } = value;

    const result = await db.query(
      `
      SELECT id, company_id, name, email, password_hash, role, is_active
      FROM user_account
      WHERE company_id = $1 AND email = $2
      LIMIT 1
      `,
      [DEFAULT_COMPANY_ID, email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      res.status(401);
      return next(new Error('Invalid email or password'));
    }

    const user = result.rows[0];

    if (!user.is_active) {
      res.status(401);
      return next(new Error('User is inactive'));
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      res.status(401);
      return next(new Error('Invalid email or password'));
    }

    await db.query(
      `UPDATE user_account SET last_login_at = NOW() WHERE id = $1`,
      [user.id]
    );

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res
      .cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000,
      })
      .cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        accessToken,
      });
  } catch (err) {
    next(err);
  }
};

exports.register = async (req, res, next) => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      res.status(400);
      return next(error);
    }

    const { name, email, password, role, employeeCode } = value;

    const existing = await db.query(
      `SELECT id FROM user_account WHERE company_id = $1 AND email = $2`,
      [DEFAULT_COMPANY_ID, email.toLowerCase()]
    );
    if (existing.rows.length > 0) {
      res.status(400);
      return next(new Error('User with this email already exists'));
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const insert = await db.query(
      `
      INSERT INTO user_account
        (company_id, employee_code, name, email, password_hash, role, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, TRUE)
      RETURNING id, name, email, role
      `,
      [
        DEFAULT_COMPANY_ID,
        employeeCode || null,
        name,
        email.toLowerCase(),
        passwordHash,
        role,
      ]
    );

    const user = insert.rows[0];

    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
};

exports.refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
      res.status(401);
      return next(new Error('No refresh token'));
    }

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const userRes = await db.query(
      `SELECT id, name, email, role, is_active FROM user_account WHERE id = $1`,
      [decoded.id]
    );
    if (userRes.rows.length === 0 || !userRes.rows[0].is_active) {
      res.status(401);
      return next(new Error('User not found or inactive'));
    }

    const user = userRes.rows[0];
    const accessToken = generateAccessToken(user);

    res
      .cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000,
      })
      .json({ accessToken });
  } catch (err) {
    next(err);
  }
};

exports.me = async (req, res) => {
  res.json({ user: req.user });
};

exports.logout = async (req, res) => {
  res
    .clearCookie('accessToken')
    .clearCookie('refreshToken')
    .json({ message: 'Logged out' });
};
