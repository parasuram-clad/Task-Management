const jwt = require('jsonwebtoken');
const Joi = require('joi');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const db = require('../db');
const { sendPasswordResetOTP } = require('../utils/emailService');
const { revokeToken } = require('../middleware/auth'); // Import revoke function

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

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
});

const verifyResetTokenSchema = Joi.object({
  token: Joi.string().length(6).required(),
});

const resetPasswordSchema = Joi.object({
  token: Joi.string().length(6).required(),
  newPassword: Joi.string().min(8).max(64).required(),
});

const firstTimePasswordSchema = Joi.object({
  email: Joi.string().email().required(),
  newPassword: Joi.string().min(8).max(64).required(),
});

const DEFAULT_COMPANY_ID = parseInt(process.env.DEFAULT_COMPANY_ID || '1', 10);

const generateAccessToken = (user) =>
  jwt.sign(
    { 
      id: user.id, 
      role: user.role,
      type: 'access'
    },
    process.env.JWT_ACCESS_SECRET
    // Remove expiresIn to make token never expire by time
  );
const generateRefreshToken = (user) =>
  jwt.sign(
    { 
      id: user.id,
      type: 'refresh' 
    },
    process.env.JWT_REFRESH_SECRET
    // Remove expiresIn to make token never expire by time
  );


// Generate 6-digit OTP
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// Mock email service - Replace with real email service in production
const sendOTPEmail = async (email, otp, userName) => {
  try {
    // Try to use real email service first
    await sendPasswordResetOTP(email, otp, userName);
    console.log(`OTP email sent to ${email}`);
  } catch (error) {
    // Fallback to console log if email service fails
    console.log(`📧 Password Reset OTP for ${email}: ${otp}`);
    console.log(`👤 User: ${userName}`);
    console.log(`⏰ OTP valid for 10 minutes`);
    
    const emailTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; }
          .otp-code { font-size: 32px; font-weight: bold; color: #2563eb; text-align: center; margin: 20px 0; }
          .footer { margin-top: 30px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Password Reset Request</h2>
          <p>Hello ${userName},</p>
          <p>You requested to reset your password. Use the OTP below to verify your identity:</p>
          <div class="otp-code">${otp}</div>
          <p>This OTP is valid for 10 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <div class="footer">
            <p>HR & Project Hub Team</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    console.log('Email content (fallback):', emailTemplate);
  }
};

// SINGLE LOGIN FUNCTION - Remove the duplicate one below
exports.login = async (req, res, next) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      res.status(400);
      return next(new Error('Please provide valid email and password'));
    }

    const { email, password } = value;

    const result = await db.query(
      `
      SELECT id, company_id, name, email, password_hash, role, is_active,
             last_login_at, created_at, password_changed_at
      FROM user_account
      WHERE company_id = $1 AND email = $2
      LIMIT 1
      `,
      [DEFAULT_COMPANY_ID, email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      res.status(401);
      return next(new Error('Invalid email address. Please check your email or contact administrator.'));
    }

    const user = result.rows[0];

    if (!user.is_active) {
      res.status(401);
      return next(new Error('Your account is inactive. Please contact administrator.'));
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      res.status(401);
      return next(new Error('Incorrect password. Please try again or use Forgot Password.'));
    }

    const isFirstTimeLogin = !user.last_login_at || !user.password_changed_at;

    await db.query(
      `UPDATE user_account SET last_login_at = NOW() WHERE id = $1`,
      [user.id]
    );

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Set cookies without maxAge (session cookies) or with very long expiry
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    };

    if (isFirstTimeLogin) {
      return res.status(200).json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        accessToken,
        requiresPasswordChange: true,
        message: 'Please set your new password'
      });
    }

    res
      .cookie('accessToken', accessToken, cookieOptions)
      .cookie('refreshToken', refreshToken, cookieOptions)
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
  try {
    let token;

    // Get token from header or cookie
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    // Revoke the token
    if (token) {
      revokeToken(token);
    }

    res
      .clearCookie('accessToken')
      .clearCookie('refreshToken')
      .json({ message: 'Logged out successfully' });
  } catch (err) {
    console.error('Logout error:', err);
    res
      .clearCookie('accessToken')
      .clearCookie('refreshToken')
      .json({ message: 'Logged out successfully' });
  }
};


exports.forgotPassword = async (req, res, next) => {
  try {
    const { error, value } = forgotPasswordSchema.validate(req.body);
    if (error) {
      res.status(400);
      return next(error);
    }

    const { email } = value;

    // Find user by email
    const result = await db.query(
      `SELECT id, name, email, is_active FROM user_account 
       WHERE company_id = $1 AND email = $2`,
      [DEFAULT_COMPANY_ID, email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      // Don't reveal whether email exists for security
      return res.json({ 
        message: 'If the email exists, OTP has been sent to your email.' 
      });
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return res.json({ 
        message: 'If the email exists, OTP has been sent to your email.' 
      });
    }

    // Generate OTP and expiry (10 minutes from now)
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP in database
    await db.query(
      `UPDATE user_account 
       SET reset_token = $1, reset_token_expiry = $2 
       WHERE id = $3`,
      [otp, otpExpiry, user.id]
    );

    // Send OTP email
    await sendOTPEmail(user.email, otp, user.name);

    res.json({ 
      message: 'If the email exists, OTP has been sent to your email.',
      // In development, you might want to return the OTP for testing
      ...(process.env.NODE_ENV === 'development' && { debug_otp: otp })
    });
  } catch (err) {
    next(err);
  }
};

exports.verifyResetToken = async (req, res, next) => {
  try {
    const { error, value } = verifyResetTokenSchema.validate(req.body);
    if (error) {
      res.status(400);
      return next(new Error('Invalid OTP format'));
    }

    const { token } = value;

    // Find user by valid OTP
    const result = await db.query(
      `SELECT id, email, name, reset_token_expiry 
       FROM user_account 
       WHERE reset_token = $1 AND reset_token_expiry > NOW()`,
      [token]
    );

    if (result.rows.length === 0) {
      res.status(400);
      return next(new Error('Invalid or expired OTP'));
    }

    const user = result.rows[0];

    res.json({ 
      valid: true, 
      email: user.email,
      message: 'OTP verified successfully'
    });
  } catch (err) {
    next(err);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { error, value } = resetPasswordSchema.validate(req.body);
    if (error) {
      res.status(400);
      return next(error);
    }

    const { token, newPassword } = value;

    // Find user by valid OTP
    const result = await db.query(
      `SELECT id, email, reset_token_expiry 
       FROM user_account 
       WHERE reset_token = $1 AND reset_token_expiry > NOW()`,
      [token]
    );

    if (result.rows.length === 0) {
      res.status(400);
      return next(new Error('Invalid or expired OTP'));
    }

    const user = result.rows[0];

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 12);

    // Update password and clear OTP
    await db.query(
      `UPDATE user_account 
       SET password_hash = $1, reset_token = NULL, reset_token_expiry = NULL 
       WHERE id = $2`,
      [passwordHash, user.id]
    );

    res.json({ 
      message: 'Password has been reset successfully. You can now login with your new password.' 
    });
  } catch (err) {
    next(err);
  }
};

// Add new endpoint for first time password update
exports.updateFirstTimePassword = async (req, res, next) => {
  try {
    const { error, value } = firstTimePasswordSchema.validate(req.body);
    if (error) {
      res.status(400);
      return next(new Error(error.details[0].message));
    }

    const { email, newPassword } = value;

    // Find user
    const result = await db.query(
      `SELECT id, email FROM user_account WHERE email = $1`,
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      res.status(404);
      return next(new Error('User not found'));
    }

    const user = result.rows[0];

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 12);

    // Update password and set password_changed_at timestamp
    await db.query(
      `UPDATE user_account 
       SET password_hash = $1, 
           password_changed_at = NOW(),
           last_login_at = NOW(),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [passwordHash, user.id]
    );

    res.json({ 
      message: 'Password updated successfully. You can now login with your new password.' 
    });
  } catch (err) {
    next(err);
  }
};


// Add these new functions to authController.js

// Get complete user profile
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const result = await db.query(
      `
      SELECT 
        id, name, email, role, employee_code, 
        phone, department, position, manager, location,
        date_of_birth, date_of_join, employment_type, shift,
        is_active, last_login_at, created_at
      FROM user_account
      WHERE id = $1
      `,
      [userId]
    );

    if (result.rows.length === 0) {
      res.status(404);
      return next(new Error('User not found'));
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

// Update user profile
exports.updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const updateSchema = Joi.object({
      name: Joi.string().min(2).max(100).optional(),
      email: Joi.string().email().optional(),
      phone: Joi.string().optional().allow(''),
    });

    const { error, value } = updateSchema.validate(req.body);
    if (error) {
      res.status(400);
      return next(new Error(error.details[0].message));
    }

    // Check if email already exists (excluding current user)
    if (value.email) {
      const existingUser = await db.query(
        `SELECT id FROM user_account WHERE email = $1 AND id != $2`,
        [value.email.toLowerCase(), userId]
      );

      if (existingUser.rows.length > 0) {
        res.status(400);
        return next(new Error('Email already exists'));
      }
    }

    // Build dynamic update query
    const updateFields = [];
    const updateValues = [];
    let paramCount = 1;

    if (value.name) {
      updateFields.push(`name = $${paramCount}`);
      updateValues.push(value.name);
      paramCount++;
    }

    if (value.email) {
      updateFields.push(`email = $${paramCount}`);
      updateValues.push(value.email.toLowerCase());
      paramCount++;
    }

    if (value.phone !== undefined) {
      updateFields.push(`phone = $${paramCount}`);
      updateValues.push(value.phone || null);
      paramCount++;
    }

    if (updateFields.length === 0) {
      res.status(400);
      return next(new Error('No valid fields to update'));
    }

    updateValues.push(userId);

    const updateQuery = `
      UPDATE user_account 
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING id, name, email, role, employee_code, phone, 
               department, position, location
    `;

    const result = await db.query(updateQuery, updateValues);
    const updatedUser = result.rows[0];

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });

  } catch (err) {
    next(err);
  }
};

// Change password
exports.changePassword = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const changePasswordSchema = Joi.object({
      currentPassword: Joi.string().required(),
      newPassword: Joi.string().min(8).max(64).required(),
    });

    const { error, value } = changePasswordSchema.validate(req.body);
    if (error) {
      res.status(400);
      return next(new Error(error.details[0].message));
    }

    // Get user with current password hash
    const result = await db.query(
      `SELECT id, password_hash FROM user_account WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      res.status(404);
      return next(new Error('User not found'));
    }

    const user = result.rows[0];

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(value.currentPassword, user.password_hash);
    if (!isCurrentPasswordValid) {
      res.status(400);
      return next(new Error('Current password is incorrect'));
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(value.newPassword, 12);

    // Update password
    await db.query(
      `UPDATE user_account 
       SET password_hash = $1, password_changed_at = NOW(), updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [newPasswordHash, userId]
    );

    res.json({
      message: 'Password changed successfully'
    });

  } catch (err) {
    next(err);
  }
};