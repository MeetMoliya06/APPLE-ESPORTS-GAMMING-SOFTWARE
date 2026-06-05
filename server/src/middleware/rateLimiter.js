// ═══════════════════════════════════════════════════════════
// Gaming Café ERP — Rate Limiting
// SOP §18: Failed Login Lock protection
// Prevents brute-force attacks on auth endpoints
// ═══════════════════════════════════════════════════════════

const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');

/**
 * Auth rate limiter — strict for login endpoints
 * SOP §18: Security Settings → Failed Login Lock
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per window
  message: {
    success: false,
    error: 'Too many login attempts. Please try again after 15 minutes.',
    code: 'RATE_LIMITED',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    logger.warn('Auth rate limit exceeded', {
      ip: req.ip,
      path: req.path,
      userAgent: req.headers['user-agent'],
    });
    res.status(429).json(options.message);
  },
  keyGenerator: (req) => {
    // Rate limit by IP + endpoint combination
    return `${req.ip}-${req.path}`;
  },
});

/**
 * General API rate limiter — moderate
 */
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 120, // 120 requests per minute
  message: {
    success: false,
    error: 'Too many requests. Please slow down.',
    code: 'RATE_LIMITED',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Strict rate limiter for sensitive operations
 * Used for: password reset, discount application, access revocation
 */
const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 attempts per hour
  message: {
    success: false,
    error: 'Too many attempts for this sensitive operation. Try again later.',
    code: 'RATE_LIMITED',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    logger.warn('Strict rate limit exceeded', {
      ip: req.ip,
      path: req.path,
      user: req.user?.id,
    });
    res.status(429).json(options.message);
  },
});

module.exports = {
  authLimiter,
  apiLimiter,
  strictLimiter,
};
