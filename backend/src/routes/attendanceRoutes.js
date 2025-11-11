// attendanceRoutes.js - Ensure routes are properly set
const express = require('express');
const router = express.Router();
const { protect, authorize, ROLES } = require('../middleware/auth');
const {
  getMyTodayAttendance,
  clockIn,
  clockOut,
  getMyAttendanceCalendar,
  requestRegularization,
  getTeamAttendanceForDate,
  getRegularizationRequests,
  approveRegularization,
  getWeeklySummary,
  getRecentAttendance,
  updateTeamAttendance,
getEmployeeAttendance} = require('../controllers/attendanceController');

// Employee routes
router.get('/me/today', protect, getMyTodayAttendance);
router.post('/me/clock-in', protect, clockIn);
router.post('/me/clock-out', protect, clockOut);
router.get('/me/calendar', protect, getMyAttendanceCalendar);
router.post('/me/regularization', protect, requestRegularization); // Regularization request

// Manager/HR/Admin routes
router.put('/team/update', protect, authorize(ROLES.MANAGER, ROLES.HR, ROLES.ADMIN), updateTeamAttendance);
router.get('/team', protect, authorize(ROLES.MANAGER, ROLES.HR, ROLES.ADMIN), getTeamAttendanceForDate);
router.get('/regularizations', protect, authorize(ROLES.MANAGER, ROLES.HR, ROLES.ADMIN), getRegularizationRequests);
router.post('/regularizations/:id/decision', protect, authorize(ROLES.MANAGER, ROLES.HR, ROLES.ADMIN), approveRegularization);
router.get('/employee/:employeeId', protect, authorize(ROLES.MANAGER, ROLES.HR, ROLES.ADMIN), getEmployeeAttendance);
// Additional routes
router.get('/me/weekly-summary', protect, getWeeklySummary);
router.get('/me/recent', protect, getRecentAttendance);

module.exports = router;