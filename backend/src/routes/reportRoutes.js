const express = require('express');
const router = express.Router();
const { protect, authorize, ROLES } = require('../middleware/auth');
const { attendanceReport, timesheetReport, weeklyAttendanceReport } = require('../controllers/reportController');

router.get('/attendance', protect, authorize(ROLES.MANAGER, ROLES.HR, ROLES.ADMIN, ROLES.FINANCE), attendanceReport);
router.get('/timesheets', protect, authorize(ROLES.MANAGER, ROLES.HR, ROLES.ADMIN, ROLES.FINANCE), timesheetReport);
router.get('/weekly-attendance', protect, authorize(ROLES.MANAGER, ROLES.HR, ROLES.ADMIN, ROLES.FINANCE), weeklyAttendanceReport);

module.exports = router;