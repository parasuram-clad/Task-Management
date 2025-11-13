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
  deleteTimesheetEntry,
  getEmployeeTimesheets,
  getMyProjectsForTimesheet,
  getMyTasksForProject,
  getMyEntriesForDate
} = require('../controllers/timesheetController');

// My timesheet routes
router.get('/me', protect, getMyWeekTimesheet);
router.post('/me/save', protect, saveMyWeekTimesheet);
router.post('/me/submit', protect, submitMyWeekTimesheet);

// Time logs by task
router.get('/task/:taskId/logs', protect, getTimeLogsByTask);

// Delete timesheet entry
router.delete('/entry/:entryId', protect, deleteTimesheetEntry);

// Project and task filtering routes
router.get('/me/projects', protect, getMyProjectsForTimesheet);
router.get('/me/projects/:projectId/tasks', protect, getMyTasksForProject);
router.get('/me/entries/date/:date', protect, getMyEntriesForDate);

// Approval routes
router.get('/approvals', protect, authorize(ROLES.MANAGER, ROLES.HR, ROLES.ADMIN), getTimesheetsForApproval);
router.post('/:id/decision', protect, authorize(ROLES.MANAGER, ROLES.HR, ROLES.ADMIN), reviewTimesheet);

// Employee timesheets
router.get('/employee/:employeeId', protect, authorize(ROLES.MANAGER, ROLES.HR, ROLES.ADMIN), getEmployeeTimesheets);

module.exports = router;