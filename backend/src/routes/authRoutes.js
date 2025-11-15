const express = require('express');
const router = express.Router();
const { 
  login, 
  register, 
  refreshToken, 
  me, 
  logout,
  forgotPassword,
  verifyResetToken,
  resetPassword,
  updateFirstTimePassword,
  getProfile,        // Add this
  updateProfile,     // Add this
  changePassword     // Add this
} = require('../controllers/authController');
const { protect, authorize, ROLES } = require('../middleware/auth');

router.post('/register', protect, authorize(ROLES.ADMIN, ROLES.HR), register);
router.post('/login', login);
router.post('/refresh', refreshToken);
router.post('/logout', protect, logout);
router.get('/me', protect, me);

// Profile routes
router.get('/profile', protect, getProfile);           // Add this
router.put('/profile', protect, updateProfile);        // Add this
router.post('/change-password', protect, changePassword); // Add this

// OTP-based password reset routes
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-token', verifyResetToken);
router.post('/reset-password', resetPassword);

// First time password update route
router.post('/first-time-password', updateFirstTimePassword);

module.exports = router;