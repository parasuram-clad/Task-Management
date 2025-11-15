const Joi = require('joi');
const bcrypt = require('bcryptjs'); // Add this import
const db = require('../db');

// Validation schema for personal settings
const personalSettingsSchema = Joi.object({
  timeZone: Joi.string().valid('Asia/Kolkata', 'UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles', 'Europe/London', 'Europe/Paris', 'Asia/Tokyo', 'Asia/Dubai').default('Asia/Kolkata'),
  timesheetNotifications: Joi.boolean().default(true),
  taskNotifications: Joi.boolean().default(true),
  attendanceAlerts: Joi.boolean().default(true),
  leaveNotifications: Joi.boolean().default(true),
  weeklySummaryEmail: Joi.boolean().default(false)
});

// Validation schema for password change
const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).required(),
  confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required()
});

// Get user's personal settings
exports.getPersonalSettings = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const result = await db.query(
      `
      SELECT 
        us.time_zone as "timeZone",
        us.timesheet_notifications as "timesheetNotifications",
        us.task_notifications as "taskNotifications",
        us.attendance_alerts as "attendanceAlerts",
        us.leave_notifications as "leaveNotifications",
        us.weekly_summary_email as "weeklySummaryEmail"
      FROM user_settings us
      WHERE us.user_id = $1
      `,
      [userId]
    );

    if (result.rows.length === 0) {
      // Return default settings if none exist
      return res.json({
        timeZone: 'Asia/Kolkata',
        timesheetNotifications: true,
        taskNotifications: true,
        attendanceAlerts: true,
        leaveNotifications: true,
        weeklySummaryEmail: false
      });
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

// Update user's personal settings
exports.updatePersonalSettings = async (req, res, next) => {
  const client = await db.pool.connect();
  
  try {
    const userId = req.user.id;
    const { error, value } = personalSettingsSchema.validate(req.body);
    
    if (error) {
      res.status(400);
      return next(new Error(error.details[0].message));
    }

    await client.query('BEGIN');

    // Upsert user settings
    const result = await client.query(
      `
      INSERT INTO user_settings (
        user_id, 
        time_zone, 
        timesheet_notifications, 
        task_notifications, 
        attendance_alerts, 
        leave_notifications, 
        weekly_summary_email,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      ON CONFLICT (user_id)
      DO UPDATE SET
        time_zone = EXCLUDED.time_zone,
        timesheet_notifications = EXCLUDED.timesheet_notifications,
        task_notifications = EXCLUDED.task_notifications,
        attendance_alerts = EXCLUDED.attendance_alerts,
        leave_notifications = EXCLUDED.leave_notifications,
        weekly_summary_email = EXCLUDED.weekly_summary_email,
        updated_at = NOW()
      RETURNING *
      `,
      [
        userId,
        value.timeZone,
        value.timesheetNotifications,
        value.taskNotifications,
        value.attendanceAlerts,
        value.leaveNotifications,
        value.weeklySummaryEmail
      ]
    );

    await client.query('COMMIT');

    // Return the updated settings in the expected format
    const updatedSettings = {
      timeZone: result.rows[0].time_zone,
      timesheetNotifications: result.rows[0].timesheet_notifications,
      taskNotifications: result.rows[0].task_notifications,
      attendanceAlerts: result.rows[0].attendance_alerts,
      leaveNotifications: result.rows[0].leave_notifications,
      weeklySummaryEmail: result.rows[0].weekly_summary_email
    };

    res.json({
      message: 'Settings updated successfully',
      settings: updatedSettings
    });

  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

// Change password
exports.changePassword = async (req, res, next) => {
  const client = await db.pool.connect();
  
  try {
    const userId = req.user.id;
    
    // Validate input using Joi
    const { error, value } = changePasswordSchema.validate(req.body);
    if (error) {
      res.status(400);
      return next(new Error(error.details[0].message));
    }

    const { currentPassword, newPassword } = value;

    await client.query('BEGIN');

    // Verify current password
    const userResult = await client.query(
      'SELECT password_hash FROM user_account WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      res.status(404);
      throw new Error('User not found');
    }

    const isValidPassword = await bcrypt.compare(currentPassword, userResult.rows[0].password_hash);
    
    if (!isValidPassword) {
      res.status(400);
      throw new Error('Current password is incorrect');
    }

    // Update password
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    await client.query(
      'UPDATE user_account SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [hashedPassword, userId]
    );

    await client.query('COMMIT');

    res.json({ message: 'Password updated successfully' });

  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};