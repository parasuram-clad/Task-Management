const db = require('../db');
const bcrypt = require('bcryptjs');
const Joi = require('joi');
const { sendEmployeeWelcomeEmail } = require('../utils/emailService');

const employeeSchema = Joi.object({
  firstName: Joi.string().min(2).max(100).required(),
  lastName: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().optional().allow(''),
  employeeId: Joi.string().optional().allow(''),
  role: Joi.string().valid('employee', 'manager', 'hr', 'admin', 'finance').required(),
  department: Joi.string().optional().allow(''),
  position: Joi.string().optional().allow(''),
  manager: Joi.string().optional().allow(''),
  dateOfBirth: Joi.date().optional().allow(''),
  dateOfJoin: Joi.date().required(),
  employmentType: Joi.string().optional().allow(''),
  shift: Joi.string().optional().allow(''),
  location: Joi.string().optional().allow(''), // ADD THIS LINE
  status: Joi.string().valid('active', 'inactive').default('active'),
});

const DEFAULT_COMPANY_ID = parseInt(process.env.DEFAULT_COMPANY_ID || '1', 10);

// Generate random password
const generateRandomPassword = () => {
  const length = 12;
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
};

// In employeeController.js - Update the createEmployee function

exports.createEmployee = async (req, res, next) => {
  try {
    const { error, value } = employeeSchema.validate(req.body);
    if (error) {
      res.status(400);
      return next(new Error(error.details[0].message));
    }

    const {
      firstName,
      lastName,
      email,
      phone,
      employeeId,
      role,
      department,
      position,
      manager,
      dateOfBirth,
      dateOfJoin,
      employmentType,
      shift,
      location,
      status
    } = value;

    // Check if email already exists
    const existingUser = await db.query(
      `SELECT id FROM user_account WHERE company_id = $1 AND email = $2`,
      [DEFAULT_COMPANY_ID, email.toLowerCase()]
    );

    if (existingUser.rows.length > 0) {
      res.status(400);
      return next(new Error('User with this email already exists'));
    }

    // Generate employee ID if not provided
    const finalEmployeeId = employeeId || await generateEmployeeId();
    
    // Generate random password
    const tempPassword = generateRandomPassword();
    const passwordHash = await bcrypt.hash(tempPassword, 12);

    // Start transaction
    await db.query('BEGIN');

    try {
      // Insert into user_account table - Note: password_changed_at is NULL for first-time users
      const userResult = await db.query(
        `
        INSERT INTO user_account (
          company_id, employee_code, name, email, password_hash, role, 
          is_active, phone, department, position, manager, location,
          date_of_birth, date_of_join, employment_type, shift,
          password_changed_at  -- Add this field
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NULL)
        RETURNING id, name, email, role, employee_code, is_active, phone, 
                 department, position, manager, location, date_of_birth, date_of_join, 
                 employment_type, shift
        `,
        [
          DEFAULT_COMPANY_ID,
          finalEmployeeId,
          `${firstName} ${lastName}`,
          email.toLowerCase(),
          passwordHash,
          role,
          status === 'active',
          phone || null,
          department || null,
          position || null,
          manager || null,
          location || null,
          dateOfBirth || null,
          dateOfJoin,
          employmentType || null,
          shift || null
        ]
      );

      const newEmployee = userResult.rows[0];

      // Send welcome email with credentials
      try {
        await sendEmployeeWelcomeEmail({
          email: newEmployee.email,
          name: newEmployee.name,
          employeeId: newEmployee.employee_code,
          tempPassword: tempPassword,
          websiteLink: process.env.WEBSITE_URL || 'http://localhost:3000'
        });
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
        // Don't fail the request if email fails
      }

      await db.query('COMMIT');

      res.status(201).json({
        message: 'Employee created successfully',
        employee: {
          id: newEmployee.id,
          name: newEmployee.name,
          email: newEmployee.email,
          role: newEmployee.role,
          employeeCode: newEmployee.employee_code,
          department: newEmployee.department,
          position: newEmployee.position,
          location: newEmployee.location,
          status: newEmployee.is_active ? 'active' : 'inactive'
        },
        emailSent: true
      });

    } catch (dbError) {
      await db.query('ROLLBACK');
      throw dbError;
    }

  } catch (err) {
    next(err);
  }
};
// Generate unique employee ID
const generateEmployeeId = async () => {
  const result = await db.query(
    `SELECT COUNT(*) as count FROM user_account WHERE company_id = $1`,
    [DEFAULT_COMPANY_ID]
  );
  const count = parseInt(result.rows[0].count) + 1;
  return `EMP${count.toString().padStart(4, '0')}`;
};

exports.listEmployees = async (req, res, next) => {
  try {
    const { role, active } = req.query;
    const params = [];
    let where = 'WHERE 1=1';

    if (role) {
      params.push(role);
      where += ` AND role = $${params.length}`;
    }
    if (active !== undefined) {
      params.push(active === 'true');
      where += ` AND is_active = $${params.length}`;
    }

    const result = await db.query(
      `
      SELECT 
        id, name, email, role, employee_code, 
        phone, department, position, manager, location,
        date_of_birth, date_of_join, employment_type, shift,
        is_active, last_login_at, created_at
      FROM user_account
      ${where}
      ORDER BY name
      `,
      params
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};


// Add these new exports to employeeController.js

exports.getEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;

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
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404);
      return next(new Error('Employee not found'));
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

exports.updateEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const updateSchema = Joi.object({
      firstName: Joi.string().min(2).max(100).optional(),
      lastName: Joi.string().min(2).max(100).optional(),
      email: Joi.string().email().optional(),
      phone: Joi.string().optional().allow(''),
      employeeId: Joi.string().optional().allow(''),
      role: Joi.string().valid('employee', 'manager', 'hr', 'admin', 'finance').optional(),
      department: Joi.string().optional().allow(''),
      position: Joi.string().optional().allow(''),
      manager: Joi.string().optional().allow(''),
      dateOfBirth: Joi.date().optional().allow(''),
      dateOfJoin: Joi.date().optional(),
      employmentType: Joi.string().optional().allow(''),
      shift: Joi.string().optional().allow(''),
      location: Joi.string().optional().allow(''),
      status: Joi.string().valid('active', 'inactive').optional(),
    });

    const { error, value } = updateSchema.validate(req.body);
    if (error) {
      res.status(400);
      return next(new Error(error.details[0].message));
    }

    // Check if employee exists
    const existingEmployee = await db.query(
      `SELECT id FROM user_account WHERE id = $1`,
      [id]
    );

    if (existingEmployee.rows.length === 0) {
      res.status(404);
      return next(new Error('Employee not found'));
    }

    // Build dynamic update query
    const updateFields = [];
    const updateValues = [];
    let paramCount = 1;

    if (value.firstName || value.lastName) {
      const firstName = value.firstName || '';
      const lastName = value.lastName || '';
      updateFields.push(`name = $${paramCount}`);
      updateValues.push(`${firstName} ${lastName}`);
      paramCount++;
    }

    const fieldsMapping = {
      email: 'email',
      phone: 'phone',
      employeeId: 'employee_code',
      role: 'role',
      department: 'department',
      position: 'position',
      manager: 'manager',
      dateOfBirth: 'date_of_birth',
      dateOfJoin: 'date_of_join',
      employmentType: 'employment_type',
      shift: 'shift',
      location: 'location',
      status: 'is_active'
    };

    Object.keys(fieldsMapping).forEach(key => {
      if (value[key] !== undefined) {
        let dbValue = value[key];
        if (key === 'status') {
          dbValue = value[key] === 'active';
        }
        updateFields.push(`${fieldsMapping[key]} = $${paramCount}`);
        updateValues.push(dbValue);
        paramCount++;
      }
    });

    if (updateFields.length === 0) {
      res.status(400);
      return next(new Error('No valid fields to update'));
    }

    updateValues.push(id); // Add ID for WHERE clause

    const updateQuery = `
      UPDATE user_account 
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING id, name, email, role, employee_code, is_active, phone, 
               department, position, manager, location, date_of_birth, 
               date_of_join, employment_type, shift
    `;

    const result = await db.query(updateQuery, updateValues);
    const updatedEmployee = result.rows[0];

    res.json({
      message: 'Employee updated successfully',
      employee: {
        id: updatedEmployee.id,
        name: updatedEmployee.name,
        email: updatedEmployee.email,
        role: updatedEmployee.role,
        employeeCode: updatedEmployee.employee_code,
        department: updatedEmployee.department,
        position: updatedEmployee.position,
        location: updatedEmployee.location,
        status: updatedEmployee.is_active ? 'active' : 'inactive'
      }
    });

  } catch (err) {
    next(err);
  }
};



// In employeeController.js - Fix the deleteEmployee function
// exports.deleteEmployee = async (req, res, next) => {
//   try {
//     const { id } = req.params;

//     // Check if employee exists
//     const existingEmployee = await db.query(
//       `SELECT id, name, email FROM user_account WHERE id = $1`,
//       [id]
//     );

//     if (existingEmployee.rows.length === 0) {
//       res.status(404);
//       return next(new Error('Employee not found'));
//     }

//     const employee = existingEmployee.rows[0];

//     // Start transaction
//     await db.query('BEGIN');

//     try {
//       // OPTION 1: Hard Delete (completely remove from database)
//       // Uncomment the following lines if you want hard delete:
//       /*
//       await db.query('DELETE FROM user_account WHERE id = $1', [id]);
//       */

//       // OPTION 2: Soft Delete (recommended - keeps data integrity)
//       // Update the user as inactive and modify email to avoid conflicts
//       const deletedEmail = `deleted_${Date.now()}_${employee.email}`;
      
//       await db.query(
//         `UPDATE user_account 
//          SET 
//            is_active = false,
//            email = $1,
//            updated_at = CURRENT_TIMESTAMP
//          WHERE id = $2`,
//         [deletedEmail, id]
//       );

//       await db.query('COMMIT');

//       res.json({
//         message: 'Employee deleted successfully',
//         employee: {
//           id: employee.id,
//           name: employee.name
//         }
//       });

//     } catch (dbError) {
//       await db.query('ROLLBACK');
//       console.error('Database error during employee deletion:', dbError);
//       throw dbError;
//     }

//   } catch (err) {
//     console.error('Error in deleteEmployee:', err);
//     next(err);
//   }
// };


// In employeeController.js - Hard Delete version
exports.deleteEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if employee exists
    const existingEmployee = await db.query(
      `SELECT id, name FROM user_account WHERE id = $1`,
      [id]
    );

    if (existingEmployee.rows.length === 0) {
      res.status(404);
      return next(new Error('Employee not found'));
    }

    const employee = existingEmployee.rows[0];

    // Start transaction
    await db.query('BEGIN');

    try {
      // Check for dependencies first (optional but recommended)
      const timesheetsCheck = await db.query(
        `SELECT id FROM timesheet WHERE user_id = $1 LIMIT 1`,
        [id]
      );

      const attendanceCheck = await db.query(
        `SELECT id FROM attendance WHERE user_id = $1 LIMIT 1`,
        [id]
      );

      // If there are dependencies, you might want to handle them
      // For now, we'll proceed with deletion
      
      // Delete the employee
      await db.query('DELETE FROM user_account WHERE id = $1', [id]);

      await db.query('COMMIT');

      res.json({
        message: 'Employee permanently deleted successfully',
        employee: {
          id: employee.id,
          name: employee.name
        }
      });

    } catch (dbError) {
      await db.query('ROLLBACK');
      console.error('Database error during employee deletion:', dbError);
      
      // Check if it's a foreign key constraint violation
      if (dbError.code === '23503') { // Foreign key violation
        res.status(400);
        return next(new Error('Cannot delete employee because they have related records (timesheets, attendance, etc.). Please deactivate instead.'));
      }
      
      throw dbError;
    }

  } catch (err) {
    console.error('Error in deleteEmployee:', err);
    next(err);
  }
};