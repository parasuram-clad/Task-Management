
const express = require('express');
const router = express.Router();
const { protect, authorize, ROLES } = require('../middleware/auth');
const { 
  listEmployees, 
  createEmployee, 
  getEmployee,
  updateEmployee 
} = require('../controllers/employeeController');

router.get('/', protect, authorize(ROLES.MANAGER, ROLES.HR, ROLES.ADMIN), listEmployees);
router.post('/', protect, authorize(ROLES.HR, ROLES.ADMIN), createEmployee);
router.get('/:id', protect, authorize(ROLES.MANAGER, ROLES.HR, ROLES.ADMIN), getEmployee);
router.put('/:id', protect, authorize(ROLES.HR, ROLES.ADMIN), updateEmployee);

module.exports = router;