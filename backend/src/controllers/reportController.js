const db = require('../db');

exports.timesheetReport = async (req, res, next) => {
  try {
    const { startDate, endDate, projectId } = req.query;
    const params = [];
    let whereConditions = [];
    let paramCount = 1;

    // Date range filtering
    if (startDate) {
      params.push(startDate);
      whereConditions.push(`te.work_date >= $${paramCount}`);
      paramCount++;
    }
    if (endDate) {
      params.push(endDate);
      whereConditions.push(`te.work_date <= $${paramCount}`);
      paramCount++;
    }

    // Project filtering
    if (projectId && projectId !== 'all') {
      params.push(projectId);
      whereConditions.push(`p.id = $${paramCount}`);
      paramCount++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    console.log('Timesheet report query params:', params);
    console.log('Where clause:', whereClause);

    // Get data by employee - FIXED: Use DISTINCT project names instead of IDs
    const employeeResult = await db.query(
      `
      SELECT 
        ua.id as user_id,
        ua.employee_code as employee_id,
        ua.name as employee_name,
        ua.department,
        COUNT(DISTINCT p.name) as projects_count, -- Count distinct project names
        COALESCE(SUM(te.hours), 0) as total_hours,
        STRING_AGG(DISTINCT p.name, ', ') as project_names -- Get project names for display
      FROM user_account ua
      LEFT JOIN timesheet ts ON ts.user_id = ua.id
      LEFT JOIN timesheet_entry te ON te.timesheet_id = ts.id
      LEFT JOIN project p ON p.id = te.project_id
      ${whereClause}
      GROUP BY ua.id, ua.employee_code, ua.name, ua.department
      HAVING COALESCE(SUM(te.hours), 0) > 0
      ORDER BY ua.name
      `,
      params
    );

    // Get data by project
    const projectResult = await db.query(
      `
      SELECT 
        p.id as project_id,
        p.name as project_name,
        COALESCE(SUM(te.hours), 0) as total_hours,
        COUNT(DISTINCT ts.user_id) as team_members
      FROM project p
      LEFT JOIN timesheet_entry te ON te.project_id = p.id
      LEFT JOIN timesheet ts ON ts.id = te.timesheet_id
      LEFT JOIN user_account ua ON ua.id = ts.user_id
      ${whereClause}
      GROUP BY p.id, p.name
      HAVING COALESCE(SUM(te.hours), 0) > 0
      ORDER BY p.name
      `,
      params
    );

    // Get employee breakdown for each project
    const projectEmployeesResult = await db.query(
      `
      SELECT 
        te.project_id,
        ua.name as employee_name,
        SUM(te.hours) as hours
      FROM timesheet_entry te
      JOIN timesheet ts ON ts.id = te.timesheet_id
      JOIN user_account ua ON ua.id = ts.user_id
      JOIN project p ON p.id = te.project_id
      ${whereClause}
      GROUP BY te.project_id, ua.name
      HAVING SUM(te.hours) > 0
      ORDER BY te.project_id, ua.name
      `,
      params
    );

    // Transform employee data
    const employeeData = employeeResult.rows.map(row => ({
      employeeId: row.employee_id || `EMP${String(row.user_id).padStart(3, '0')}`,
      employeeName: row.employee_name,
      department: row.department || 'Not Assigned',
      totalHours: parseFloat(row.total_hours) || 0,
      projects: parseInt(row.projects_count) || 0,
      projectNames: row.project_names || '' // Add project names for display
    }));

    // Group employee data by project
    const employeesByProject = {};
    projectEmployeesResult.rows.forEach(row => {
      const projectId = `PRJ${String(row.project_id).padStart(3, '0')}`;
      if (!employeesByProject[projectId]) {
        employeesByProject[projectId] = [];
      }
      employeesByProject[projectId].push({
        name: row.employee_name,
        hours: parseFloat(row.hours) || 0
      });
    });

    // Transform project data
    const projectData = projectResult.rows.map(row => ({
      projectId: `PRJ${String(row.project_id).padStart(3, '0')}`,
      projectName: row.project_name,
      totalHours: parseFloat(row.total_hours) || 0,
      teamMembers: parseInt(row.team_members) || 0,
      employees: employeesByProject[`PRJ${String(row.project_id).padStart(3, '0')}`] || []
    }));

    console.log(`Found ${employeeData.length} employees and ${projectData.length} projects`);

    res.json({
      byEmployee: employeeData,
      byProject: projectData
    });
  } catch (err) {
    console.error('Error in timesheetReport:', err);
    next(err);
  }
};
exports.attendanceReport = async (req, res, next) => {
  try {
    const { startDate, endDate, roles, department } = req.query;
    const params = [];
    let whereConditions = ['ua.is_active = true'];
    let paramCount = 1;

    // Date range filtering
    if (startDate) {
      params.push(startDate);
      whereConditions.push(`a.work_date >= $${paramCount}`);
      paramCount++;
    }
    if (endDate) {
      params.push(endDate);
      whereConditions.push(`a.work_date <= $${paramCount}`);
      paramCount++;
    }

    // Role-based filtering
    if (roles && roles !== 'all') {
      const roleList = Array.isArray(roles) ? roles : roles.split(',');
      if (roleList.length > 0) {
        const rolePlaceholders = roleList.map((_, index) => `$${paramCount + index}`).join(',');
        params.push(...roleList);
        whereConditions.push(`ua.role IN (${rolePlaceholders})`);
        paramCount += roleList.length;
      }
    }

    // Department filtering (optional)
    if (department && department !== 'all') {
      params.push(department);
      whereConditions.push(`ua.department = $${paramCount}`);
      paramCount++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Debug: Log the query and parameters
    console.log('Query params:', params);
    console.log('Where clause:', whereClause);

    const result = await db.query(
      `
      SELECT 
        ua.id as user_id,
        ua.employee_code as employee_id,
        ua.name as employee_name,
        ua.department,
        ua.role,
        ua.location,
        COUNT(a.id) as total_days,
        COUNT(CASE WHEN a.status = 'present' THEN 1 END) as days_present,
        COUNT(CASE WHEN a.status = 'absent' THEN 1 END) as days_absent,
        COUNT(CASE WHEN a.status = 'leave' THEN 1 END) as leaves,
        COUNT(CASE WHEN a.check_in_at IS NOT NULL AND EXTRACT(HOUR FROM a.check_in_at) >= 9 AND a.status = 'present' THEN 1 END) as late_arrivals,
        COUNT(CASE WHEN a.check_out_at IS NOT NULL AND a.check_in_at IS NOT NULL AND EXTRACT(EPOCH FROM (a.check_out_at - a.check_in_at)) < 28800 THEN 1 END) as early_checkouts,
        COALESCE(SUM(
          CASE 
            WHEN a.check_in_at IS NOT NULL AND a.check_out_at IS NOT NULL 
            THEN EXTRACT(EPOCH FROM (a.check_out_at - a.check_in_at)) / 3600 
            ELSE 0 
          END
        ), 0) as total_hours
      FROM user_account ua
      LEFT JOIN attendance a ON ua.id = a.user_id
        ${startDate && endDate ? `AND a.work_date BETWEEN '${startDate}' AND '${endDate}'` : ''}
        ${startDate && !endDate ? `AND a.work_date >= '${startDate}'` : ''}
        ${!startDate && endDate ? `AND a.work_date <= '${endDate}'` : ''}
      ${whereClause}
      GROUP BY ua.id, ua.employee_code, ua.name, ua.department, ua.role, ua.location
      ORDER BY ua.name
      `,
      params
    );

    console.log('Query result rows:', result.rows.length);

    // Transform the data for frontend
    const reportData = result.rows.map(row => ({
      employeeId: row.employee_id || `EMP${String(row.user_id).padStart(3, '0')}`,
      employeeName: row.employee_name,
      department: row.department || 'Not Assigned',
      role: row.role,
      location: row.location || 'Not Specified',
      daysPresent: parseInt(row.days_present) || 0,
      daysAbsent: parseInt(row.days_absent) || 0,
      leaves: parseInt(row.leaves) || 0,
      lateArrivals: parseInt(row.late_arrivals) || 0,
      earlyCheckouts: parseInt(row.early_checkouts) || 0,
      totalHours: parseFloat(row.total_hours) || 0
    }));

    console.log('Transformed report data:', reportData);

    res.json(reportData);
  } catch (err) {
    console.error('Error in attendanceReport:', err);
    next(err);
  }
};

exports.weeklyAttendanceReport = async (req, res, next) => {
  try {
    const { startDate, endDate, roles } = req.query;
    const params = [];
    let whereConditions = ['ua.is_active = true'];
    let paramCount = 1;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate are required' });
    }

    params.push(startDate, endDate);

    if (roles && roles !== 'all') {
      const roleList = Array.isArray(roles) ? roles : roles.split(',');
      if (roleList.length > 0) {
        const rolePlaceholders = roleList.map((_, index) => `$${paramCount + 2 + index}`).join(',');
        params.push(...roleList);
        whereConditions.push(`ua.role IN (${rolePlaceholders})`);
      }
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    console.log('Weekly attendance report query params:', params);

    // Get all active users
    const usersResult = await db.query(
      `
      SELECT 
        ua.id as user_id,
        ua.employee_code as employee_id,
        ua.name as employee_name,
        ua.department,
        ua.role
      FROM user_account ua
      ${whereClause}
      ORDER BY ua.name
      `,
      params.slice(2)
    );

    // Get attendance data for the date range - NO TIMEZONE CONVERSION
    const attendanceResult = await db.query(
      `
      SELECT 
        a.user_id,
        a.work_date,
        a.status,
        a.check_in_at,
        a.check_out_at,
        -- Simple calculations without timezone conversion
        CASE 
          WHEN a.check_in_at IS NOT NULL AND EXTRACT(HOUR FROM a.check_in_at) >= 9 THEN true
          ELSE false
        END as late_arrival,
        -- Calculate early checkout (less than 8 hours)
        CASE 
          WHEN a.check_in_at IS NOT NULL AND a.check_out_at IS NOT NULL 
          AND EXTRACT(EPOCH FROM (a.check_out_at - a.check_in_at)) < 28800 THEN true
          ELSE false
        END as early_checkout,
        -- Calculate early checkin (before 9:00 AM)
        CASE 
          WHEN a.check_in_at IS NOT NULL AND EXTRACT(HOUR FROM a.check_in_at) < 9 THEN true
          ELSE false
        END as early_checkin,
        -- Calculate late checkout (after 6:00 PM)
        CASE 
          WHEN a.check_out_at IS NOT NULL AND EXTRACT(HOUR FROM a.check_out_at) >= 18 THEN true
          ELSE false
        END as late_checkout,
        -- Calculate hours worked
        CASE 
          WHEN a.check_in_at IS NOT NULL AND a.check_out_at IS NOT NULL 
          THEN EXTRACT(EPOCH FROM (a.check_out_at - a.check_in_at)) / 3600 
          ELSE 0 
        END as hours_worked
      FROM attendance a
      WHERE a.work_date BETWEEN $1 AND $2
      ORDER BY a.user_id, a.work_date
      `,
      [startDate, endDate]
    );

    console.log('Users found:', usersResult.rows.length);
    console.log('Attendance records found:', attendanceResult.rows.length);

    // Create a map of attendance records by user_id and date
    const attendanceMap = new Map();
    attendanceResult.rows.forEach(row => {
      const key = `${row.user_id}-${row.work_date.toISOString().split('T')[0]}`;
      attendanceMap.set(key, row);
    });

    // Generate all dates in the range
    const allDates = [];
    const currentDate = new Date(startDate);
    const endDateObj = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    while (currentDate <= endDateObj) {
      const dateStr = new Date(currentDate).toISOString().split('T')[0];
      allDates.push(dateStr);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Transform the data for frontend
    const reportData = usersResult.rows.map(user => {
      const employee = {
        employeeId: user.employee_id || `EMP${String(user.user_id).padStart(3, '0')}`,
        employeeName: user.employee_name,
        department: user.department || 'Not Assigned',
        role: user.role,
        dailyAttendance: [],
        totalHours: 0,
        presentDays: 0,
        absentDays: 0,
        lateArrivals: 0,
        earlyCheckouts: 0
      };

      // Create attendance record for each date in the range
      allDates.forEach(date => {
        const dateObj = new Date(date);
        const key = `${user.user_id}-${date}`;
        const attendanceRecord = attendanceMap.get(key);
        
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const day = dayNames[dateObj.getDay()];
        
        const isPastDate = dateObj < today;
        const isToday = dateObj.getTime() === today.getTime();
        
        if (attendanceRecord) {
          // Use timestamps directly as stored in database
          const status = attendanceRecord.check_in_at ? 'present' : 'absent';
          const hours = parseFloat(attendanceRecord.hours_worked) || 0;
          
          employee.dailyAttendance.push({
            date: date,
            day: day,
            checkIn: attendanceRecord.check_in_at,
            checkOut: attendanceRecord.check_out_at,
            hours: hours,
            status: status,
            lateArrival: attendanceRecord.late_arrival,
            earlyCheckout: attendanceRecord.early_checkout,
            earlyCheckin: attendanceRecord.early_checkin,
            lateCheckout: attendanceRecord.late_checkout
          });

          if (status === 'present') {
            employee.presentDays++;
            employee.totalHours += hours;
          } else {
            employee.absentDays++;
          }

          if (attendanceRecord.late_arrival) employee.lateArrivals++;
          if (attendanceRecord.early_checkout) employee.earlyCheckouts++;
        } else {
          // No attendance record
          let status = 'absent';
          
          if (isPastDate || (isToday && new Date().getHours() >= 18)) {
            status = 'absent';
            employee.absentDays++;
          } else {
            return;
          }
          
          employee.dailyAttendance.push({
            date: date,
            day: day,
            checkIn: null,
            checkOut: null,
            hours: 0,
            status: status,
            lateArrival: false,
            earlyCheckout: false,
            earlyCheckin: false,
            lateCheckout: false
          });
        }
      });

      employee.dailyAttendance = employee.dailyAttendance.filter(Boolean);
      return employee;
    });

    console.log('Transformed weekly report data:', reportData.length, 'employees');
    res.json(reportData);
  } catch (err) {
    console.error('Error in weeklyAttendanceReport:', err);
    next(err);
  }
};