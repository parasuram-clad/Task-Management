const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { 
  getPersonalSettings, 
  updatePersonalSettings, 
  changePassword 
} = require('../controllers/settingsController');

// Personal settings routes
router.get('/personal', protect, getPersonalSettings);
router.put('/personal', protect, updatePersonalSettings);
router.post('/change-password', protect, changePassword);

module.exports = router;