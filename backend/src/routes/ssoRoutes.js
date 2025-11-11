const express = require('express');
const passport = require('passport');
const router = express.Router();
const { handleAdfsCallback } = require('../controllers/ssoController');

router.get(
  '/adfs/login',
  passport.authenticate('adfs', { failureRedirect: '/login', session: false })
);

router.post(
  '/adfs/callback',
  passport.authenticate('adfs', { failureRedirect: '/login', session: false }),
  handleAdfsCallback
);

module.exports = router;
