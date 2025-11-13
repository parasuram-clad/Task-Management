const express = require('express');
const router = express.Router();
const { protect, authorize, ROLES } = require('../middleware/auth');
const {
  listProjects,
  createProject,
  getProjectById,
  addMemberToProject,
  updateProject,
  removeMemberFromProject,
  getEmployeeProjects,
  getProjectTimesheets // Make sure this is imported
} = require('../controllers/projectController');

router.get('/', protect, listProjects);
router.post('/', protect, authorize(ROLES.MANAGER, ROLES.HR, ROLES.ADMIN), createProject);
router.get('/:id', protect, getProjectById);
router.put('/:id', protect, authorize(ROLES.MANAGER, ROLES.HR, ROLES.ADMIN), updateProject);
router.post('/:id/members', protect, authorize(ROLES.MANAGER, ROLES.HR, ROLES.ADMIN), addMemberToProject);
router.delete('/:id/members/:memberId', protect, authorize(ROLES.MANAGER, ROLES.HR, ROLES.ADMIN), removeMemberFromProject);
router.get('/employee/:employeeId', protect, getEmployeeProjects);

// Make sure this route is added
router.get('/:projectId/timesheets', protect, getProjectTimesheets);

module.exports = router;