const Joi = require('joi');
const db = require('../db');

const regularizationSchema = Joi.object({
  workDate: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required(),
  type: Joi.string().valid('check_in', 'check_out').required(),
  proposedTime: Joi.string().pattern(/^\d{2}:\d{2}$/).required(),
  reason: Joi.string().min(5).max(500).required(),
});

const todayISO = () => new Date().toISOString().slice(0, 10);

exports.getMyTodayAttendance = async (req, res, next) => {
  try {
    const date = todayISO();
    const result = await db.query(
      `SELECT id, user_id, work_date, status, check_in_at, check_out_at
       FROM attendance
       WHERE user_id = $1 AND work_date = $2`,
      [req.user.id, date]
    );
    if (result.rows.length === 0) {
      return res.json({
        id: null,
        user_id: req.user.id,
        work_date: date,
        status: 'not_checked_in',
        check_in_at: null,
        check_out_at: null,
      });
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

exports.clockIn = async (req, res, next) => {
  try {
    const date = todayISO();
    const result = await db.query(
      `
      INSERT INTO attendance (user_id, work_date, status, check_in_at)
      VALUES ($1, $2, 'present', NOW())
      ON CONFLICT (user_id, work_date)
      DO UPDATE SET
        check_in_at = COALESCE(attendance.check_in_at, EXCLUDED.check_in_at),
        status = 'present'
      RETURNING id, user_id, work_date, status, check_in_at, check_out_at
      `,
      [req.user.id, date]
    );
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

exports.clockOut = async (req, res, next) => {
  try {
    const date = todayISO();

    const existing = await db.query(
      `SELECT id, check_in_at, check_out_at
       FROM attendance
       WHERE user_id = $1 AND work_date = $2`,
      [req.user.id, date]
    );
    if (existing.rows.length === 0 || !existing.rows[0].check_in_at) {
      res.status(400);
      return next(new Error('Cannot check out without checking in'));
    }
    if (existing.rows[0].check_out_at) {
      res.status(400);
      return next(new Error('Already checked out today'));
    }

    const result = await db.query(
      `
      UPDATE attendance
      SET check_out_at = NOW()
      WHERE user_id = $1 AND work_date = $2
      RETURNING id, user_id, work_date, status, check_in_at, check_out_at
      `,
      [req.user.id, date]
    );
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

exports.getMyAttendanceCalendar = async (req, res, next) => {
  try {
    const { year, month } = req.query;
    let query = `SELECT id, user_id, work_date, status, check_in_at, check_out_at
                 FROM attendance
                 WHERE user_id = $1`;
    const params = [req.user.id];

    if (year && month) {
      query += ` AND work_date >= $2 AND work_date < ($2::date + INTERVAL '1 month')`;
      params.push(`${year}-${String(month).padStart(2, '0')}-01`);
    }

    query += ` ORDER BY work_date`;
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

exports.requestRegularization = async (req, res, next) => {
  try {
    const { error, value } = regularizationSchema.validate(req.body);
    if (error) {
      res.status(400);
      return next(error);
    }

    const { workDate, type, proposedTime, reason } = value;

    const existing = await db.query(
      `
      SELECT id
      FROM attendance_regularization
      WHERE user_id = $1 AND work_date = $2 AND type = $3 AND status = 'pending'
      `,
      [req.user.id, workDate, type]
    );
    if (existing.rows.length > 0) {
      res.status(400);
      return next(new Error('Regularization already requested for this date and type'));
    }

    const insert = await db.query(
      `
      INSERT INTO attendance_regularization
        (user_id, work_date, type, proposed_time, reason, status)
      VALUES ($1, $2, $3, $4, $5, 'pending')
      RETURNING *
      `,
      [req.user.id, workDate, type, proposedTime, reason]
    );
    res.status(201).json(insert.rows[0]);
  } catch (err) {
    next(err);
  }
};
exports.getTeamAttendanceForDate = async (req, res, next) => {
  try {
    const date = req.query.date || todayISO();
    
    console.log('=== FETCHING TEAM ATTENDANCE ===');
    console.log('Date:', date);
    
    // CORRECTED QUERY: Get attendance specifically for the requested date
    const result = await db.query(
      `
      SELECT 
        ua.id as user_id,
        ua.employee_code,
        ua.name AS user_name,
        ua.email,
        ua.department,
        $1 as work_date,
        a.status,
        a.check_in_at,
        a.check_out_at,
        a.id as attendance_id
      FROM user_account ua
      LEFT JOIN attendance a ON ua.id = a.user_id AND a.work_date = $1
      WHERE ua.is_active = true
      ORDER BY ua.name
      `,
      [date]
    );
    
    console.log('\n=== RAW DATABASE RESULTS (BEFORE TRANSFORM) ===');
    console.log('Total records:', result.rows.length);
    
    // Print each raw database row
    result.rows.forEach((row, index) => {
      console.log(`\n--- Record ${index + 1} ---`);
      console.log('User ID:', row.user_id);
      console.log('User Name:', row.user_name);
      console.log('Work Date:', row.work_date);
      console.log('Attendance ID:', row.attendance_id);
      console.log('Database Status:', row.status);
      console.log('Check In:', row.check_in_at);
      console.log('Check Out:', row.check_out_at);
      console.log('Has Attendance Record:', !!row.attendance_id);
    });
    
    // CORRECTED TRANSFORMATION LOGIC
    const transformedRows = result.rows.map(row => {
      // Determine status based on whether there's an attendance record for THIS date
      let status = 'absent'; // Default status
      
      if (row.attendance_id && row.status === 'present') {
        status = 'present';
      }
      // If no attendance record for this date OR status is not 'present', status remains 'absent'
      
      return {
        id: row.attendance_id || `user_${row.user_id}`,
        user_id: row.user_id,
        employee_code: row.employee_code && row.employee_code.trim() !== "" 
          ? row.employee_code 
          : `EMP${String(row.user_id).padStart(3, '0')}`,
        user_name: row.user_name,
        email: row.email,
        department: row.department,
        work_date: row.work_date,
        status: status,
        check_in_at: row.check_in_at,
        check_out_at: row.check_out_at,
        attendance_id: row.attendance_id
      };
    });

    console.log('\n=== TRANSFORMED ROWS (AFTER TRANSFORM) ===');
    console.log('Total transformed records:', transformedRows.length);
    
    // Print each transformed row
    transformedRows.forEach((row, index) => {
      console.log(`\n--- Transformed Record ${index + 1} ---`);
      console.log('User ID:', row.user_id);
      console.log('User Name:', row.user_name);
      console.log('Work Date:', row.work_date);
      console.log('Final Status:', row.status);
      console.log('Check In:', row.check_in_at);
      console.log('Check Out:', row.check_out_at);
      console.log('Attendance ID:', row.attendance_id);
    });

    console.log('\n=== STATUS SUMMARY ===');
    const statusCount = transformedRows.reduce((acc, row) => {
      acc[row.status] = (acc[row.status] || 0) + 1;
      return acc;
    }, {});
    console.log('Status Count:', statusCount);

    console.log('=== END OF ATTENDANCE DATA ===\n');
    
    res.json(transformedRows);
  } catch (err) {
    console.error('Error in getTeamAttendanceForDate:', err);
    next(err);
  }
};
exports.getWeeklySummary = async (req, res, next) => {
  try {
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date();
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const result = await db.query(
      `
      SELECT 
        COUNT(*) FILTER (WHERE status = 'present') as days_present,
        COUNT(*) FILTER (WHERE EXTRACT(HOUR FROM check_in_at) >= 9 AND status = 'present') as late_arrivals,
        COALESCE(SUM(EXTRACT(EPOCH FROM (check_out_at - check_in_at)) / 3600), 0) as total_hours
      FROM attendance 
      WHERE user_id = $1 
        AND work_date >= $2 
        AND work_date <= $3
      `,
      [req.user.id, startOfWeek.toISOString().slice(0, 10), endOfWeek.toISOString().slice(0, 10)]
    );

    const row = result.rows[0];
    const daysPresent = parseInt(row.days_present) || 0;
    const totalHours = parseFloat(row.total_hours) || 0;
    const averageHours = daysPresent > 0 ? Math.round((totalHours / daysPresent) * 10) / 10 : 0;

    res.json({
      daysPresent,
      totalHours: Math.round(totalHours * 10) / 10,
      averageHours,
      lateArrivals: parseInt(row.late_arrivals) || 0,
    });
  } catch (err) {
    next(err);
  }
};

exports.getRecentAttendance = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const result = await db.query(
      `
      SELECT 
        work_date,
        status,
        check_in_at,
        check_out_at,
        CASE 
          WHEN check_in_at IS NOT NULL AND check_out_at IS NOT NULL 
          THEN EXTRACT(EPOCH FROM (check_out_at - check_in_at)) / 3600
          ELSE 0 
        END as hours
      FROM attendance 
      WHERE user_id = $1 
        AND work_date >= $2
      ORDER BY work_date DESC
      `,
      [req.user.id, startDate.toISOString().slice(0, 10)]
    );

   const recentAttendance = result.rows.map(row => {
  return {
    date: row.work_date,  // don't convert (fix date shifting)
    day: new Date(row.work_date + "T00:00:00").toLocaleDateString('en-IN', { weekday: 'long' }),
    checkIn: row.check_in_at ? 
      new Date(row.check_in_at).toLocaleTimeString('en-IN', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      }) : '--',
    checkOut: row.check_out_at ? 
      new Date(row.check_out_at).toLocaleTimeString('en-IN', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      }) : '--',
    hours: parseFloat(row.hours) || 0,
    status: row.status === 'present' ? 'Present' : 'Absent'
  };
});


    res.json(recentAttendance);
  } catch (err) {
    next(err);
  }
};

exports.getRegularizationRequests = async (req, res, next) => {
  try {
    const result = await db.query(
      `
      SELECT ar.*, ua.name AS user_name, ua.email
      FROM attendance_regularization ar
      JOIN user_account ua ON ua.id = ar.user_id
      WHERE ar.status = 'pending'
      ORDER BY ar.created_at DESC
      `
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};



exports.approveRegularization = async (req, res, next) => {
  try {
    const { action, comment } = req.body; // 'approve' or 'reject'
    if (!['approve', 'reject'].includes(action)) {
      res.status(400);
      return next(new Error('Invalid action'));
    }

    const requestId = req.params.id;

    const existing = await db.query(
      `SELECT * FROM attendance_regularization WHERE id = $1`,
      [requestId]
    );
    if (existing.rows.length === 0) {
      res.status(404);
      return next(new Error('Request not found'));
    }

    const status = action === 'approve' ? 'approved' : 'rejected';
    const update = await db.query(
      `
      UPDATE attendance_regularization
      SET status = $1, reviewed_by = $2, reviewed_at = NOW(), review_comment = $4
      WHERE id = $3
      RETURNING *
      `,
      [status, req.user.id, requestId, comment || null]
    );

    res.json(update.rows[0]);
  } catch (err) {
    next(err);
  }
};

exports.updateTeamAttendance = async (req, res, next) => {
  try {
    const { userId, workDate, status, checkInTime, checkOutTime } = req.body;

    // Validate required fields
    if (!userId || !workDate || !status) {
      res.status(400);
      return next(new Error('User ID, work date, and status are required'));
    }

    const dbStatus = status;

    // Convert time strings to proper timestamps (assuming times are in IST)
    let checkInTimestamp = null;
    let checkOutTimestamp = null;

    // Only set check-in/out times for present status
    if (dbStatus === 'present') {
      if (checkInTime) {
        const [hours, minutes] = checkInTime.split(':');
        if (hours && minutes) {
          // Create date in IST and convert to UTC for storage
          const istDate = new Date(`${workDate}T${hours}:${minutes}:00+05:30`);
          checkInTimestamp = new Date(istDate.getTime() - (5 * 60 + 30) * 60 * 1000);
        }
      }

      if (checkOutTime) {
        const [hours, minutes] = checkOutTime.split(':');
        if (hours && minutes) {
          // Create date in IST and convert to UTC for storage
          const istDate = new Date(`${workDate}T${hours}:${minutes}:00+05:30`);
          checkOutTimestamp = new Date(istDate.getTime() - (5 * 60 + 30) * 60 * 1000);
        }
      }
    } else {
      // For absent, clear check-in/out times
      checkInTimestamp = null;
      checkOutTimestamp = null;
    }

    // Check if attendance record already exists
    const existingRecord = await db.query(
      `SELECT id FROM attendance WHERE user_id = $1 AND work_date = $2`,
      [userId, workDate]
    );

    let result;
    
    if (existingRecord.rows.length > 0) {
      // Update existing record
      result = await db.query(
        `
        UPDATE attendance 
        SET status = $1, check_in_at = $2, check_out_at = $3, updated_at = NOW()
        WHERE user_id = $4 AND work_date = $5
        RETURNING *
        `,
        [dbStatus, checkInTimestamp, checkOutTimestamp, userId, workDate]
      );
    } else {
      // Insert new record
      result = await db.query(
        `
        INSERT INTO attendance (user_id, work_date, status, check_in_at, check_out_at)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
        `,
        [userId, workDate, dbStatus, checkInTimestamp, checkOutTimestamp]
      );
    }

    res.json({
      message: 'Attendance updated successfully',
      attendance: result.rows[0]
    });

  } catch (err) {
    next(err);
  }
};