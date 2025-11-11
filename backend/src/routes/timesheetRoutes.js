const express = require('express');
const router = express.Router();
const { protect, authorize, ROLES } = require('../middleware/auth');
const {
  getMyWeekTimesheet,
  saveMyWeekTimesheet,
  submitMyWeekTimesheet,
  getTimesheetsForApproval,
  reviewTimesheet,
  getTimeLogsByTask,
  deleteTimesheetEntry ,getEmployeeTimesheets
} = require('../controllers/timesheetController');

router.get('/me', protect, getMyWeekTimesheet);
router.post('/me/save', protect, saveMyWeekTimesheet);
router.post('/me/submit', protect, submitMyWeekTimesheet);

// Add this route to timesheetRoutes.js
router.get('/task/:taskId/logs', protect, getTimeLogsByTask);

// Add delete route
router.delete('/entry/:entryId', protect, deleteTimesheetEntry);

router.get('/approvals', protect, authorize(ROLES.MANAGER, ROLES.HR, ROLES.ADMIN), getTimesheetsForApproval);
router.post('/:id/decision', protect, authorize(ROLES.MANAGER, ROLES.HR, ROLES.ADMIN), reviewTimesheet);

router.get('/employee/:employeeId', protect, authorize(ROLES.MANAGER, ROLES.HR, ROLES.ADMIN), getEmployeeTimesheets);

module.exports = router;