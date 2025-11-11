const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getMyTasks,
  getProjectTasks,
  createTask,
  updateTask,
  addTaskComment,
  deleteTask // Add this import
} = require('../controllers/taskController');

router.get('/me', protect, getMyTasks);
router.get('/project/:projectId', protect, getProjectTasks);
router.post('/', protect, createTask);
router.put('/:id', protect, updateTask);
router.delete('/:id', protect, deleteTask); // Add this DELETE route
router.post('/:id/comments', protect, addTaskComment);

module.exports = router;