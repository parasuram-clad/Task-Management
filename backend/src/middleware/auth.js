const jwt = require('jsonwebtoken');
const db = require('../db');
const { ROLES } = require('../utils/roles');

// Store revoked tokens in memory (for production, use Redis)
const revokedTokens = new Set();

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    res.status(401);
    return next(new Error('Not authorized, no token'));
  }

  try {
    // Check if token is revoked
    if (revokedTokens.has(token)) {
      res.status(401);
      return next(new Error('Token has been revoked'));
    }

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    const userRes = await db.query(
      `SELECT id, company_id, name, email, role, is_active
       FROM user_account
       WHERE id = $1`,
      [decoded.id]
    );
    
    if (userRes.rows.length === 0 || !userRes.rows[0].is_active) {
      res.status(401);
      return next(new Error('User not found or inactive'));
    }
    
    req.user = userRes.rows[0];
    next();
  } catch (err) {
    res.status(401);
    next(new Error('Not authorized, token invalid'));
  }
};

const authorize = (...allowedRoles) => (req, res, next) => {
  if (!req.user || !allowedRoles.includes(req.user.role)) {
    res.status(403);
    return next(new Error('Forbidden – insufficient permissions'));
  }
  next();
};

// Function to revoke token (call this on logout)
const revokeToken = (token) => {
  revokedTokens.add(token);
  
  // Optional: Clean up old tokens periodically
  if (revokedTokens.size > 1000) {
    // Keep only recent 1000 revoked tokens
    const tokensArray = Array.from(revokedTokens);
    revokedTokens.clear();
    tokensArray.slice(-500).forEach(t => revokedTokens.add(t));
  }
};

// Function to check if token is revoked
const isTokenRevoked = (token) => {
  return revokedTokens.has(token);
};

module.exports = { 
  protect, 
  authorize, 
  ROLES, 
  revokeToken, 
  isTokenRevoked 
};