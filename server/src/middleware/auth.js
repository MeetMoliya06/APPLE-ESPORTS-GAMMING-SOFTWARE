// ═══════════════════════════════════════════════════════════
// Gaming Café ERP — JWT Authentication Middleware
// SOP §21.1: JWT Tokens + Session Persistence
// ═══════════════════════════════════════════════════════════

const jwt = require('jsonwebtoken');
const { config } = require('../config/environment');
const logger = require('../utils/logger');

/**
 * Verify JWT access token
 * SOP §21.2: NEVER TRUST FRONTEND — all permissions validated in backend
 */
function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'AUTH_REQUIRED',
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwt.secret);

    // Attach user info to request
    req.user = {
      id: decoded.id,
      role: decoded.role,
      branchId: decoded.branchId || null,
      name: decoded.name,
      dashboardPermissions: decoded.dashboardPermissions || null,
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expired',
        code: 'TOKEN_EXPIRED',
      });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token',
        code: 'TOKEN_INVALID',
      });
    }
    logger.error('Authentication error', { error: error.message });
    return res.status(500).json({
      success: false,
      error: 'Authentication failed',
    });
  }
}

/**
 * Optional authentication — doesn't block if no token
 * Used for public endpoints that behave differently for auth users
 */
function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwt.secret);
    req.user = {
      id: decoded.id,
      role: decoded.role,
      branchId: decoded.branchId || null,
      name: decoded.name,
    };
  } catch {
    req.user = null;
  }
  next();
}

/**
 * Generate access token
 * SOP: Super Admin session should persist (longer expiry)
 */
function generateAccessToken(payload) {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.accessExpiry,
  });
}

/**
 * Generate refresh token
 */
function generateRefreshToken(payload) {
  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiry,
  });
}

/**
 * Verify refresh token
 */
function verifyRefreshToken(token) {
  return jwt.verify(token, config.jwt.refreshSecret);
}

module.exports = {
  authenticate,
  optionalAuth,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
};
