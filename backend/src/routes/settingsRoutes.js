const express = require('express');
const router = express.Router();
const { protect, authorize, ROLES } = require('../middleware/auth');
const { getSettings } = require('../controllers/settingsController');

router.get('/', protect, authorize(ROLES.ADMIN), getSettings);

module.exports = router;
