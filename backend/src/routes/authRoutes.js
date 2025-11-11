const express = require('express');
const router = express.Router();
const { login, register, refreshToken, me, logout } = require('../controllers/authController');
const { protect, authorize, ROLES } = require('../middleware/auth');

router.post('/register', protect, authorize(ROLES.ADMIN, ROLES.HR), register);
router.post('/login', login);
router.post('/refresh', refreshToken);
router.post('/logout', protect, logout);
router.get('/me', protect, me);

module.exports = router;
