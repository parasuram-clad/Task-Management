// In employeeRoutes.js
const express = require('express');
const router = express.Router();
const { protect, authorize, ROLES } = require('../middleware/auth');
const { 
  listEmployees, 
  createEmployee, 
  getEmployee,
  updateEmployee,
  deleteEmployee  // Add this import
} = require('../controllers/employeeController');

router.get('/', protect, authorize(ROLES.MANAGER, ROLES.HR, ROLES.ADMIN, ROLES.FINANCE, ROLES.EMPLOYEE), listEmployees);
router.post('/', protect, authorize(ROLES.HR, ROLES.ADMIN), createEmployee);
router.get('/:id', protect, authorize(ROLES.MANAGER, ROLES.HR, ROLES.ADMIN), getEmployee);
router.put('/:id', protect, authorize(ROLES.HR, ROLES.ADMIN), updateEmployee);
router.delete('/:id', protect, authorize(ROLES.HR, ROLES.ADMIN), deleteEmployee); // Add this route

module.exports = router;