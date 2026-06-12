// ═══════════════════════════════════════════════════════════
// Gaming Café ERP — Global Error Handler
// Structured error responses for production safety
// ═══════════════════════════════════════════════════════════

const logger = require('../utils/logger');

/**
 * Custom application error class
 */
class AppError extends Error {
  constructor(message, statusCode, code = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 404 handler — route not found
 */
function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.path} not found`,
    code: 'NOT_FOUND',
  });
}

/**
 * Global error handler middleware
 * Must be registered LAST in the middleware chain
 */
function globalErrorHandler(err, req, res, _next) {
  // Default values
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let code = err.code || 'INTERNAL_ERROR';

  // Log the error
  if (statusCode >= 500) {
    logger.error('Server Error', {
      error: message,
      stack: err.stack,
      path: req.path,
      method: req.method,
      user: req.user?.id,
    });
  } else {
    logger.warn('Client Error', {
      error: message,
      code,
      path: req.path,
      method: req.method,
      user: req.user?.id,
    });
  }

  // PostgreSQL specific errors
  if (err.code === '23505') {
    statusCode = 409;
    message = 'Duplicate entry. This record already exists.';
    code = 'DUPLICATE_ENTRY';
  }
  if (err.code === '23503') {
    statusCode = 400;
    message = 'Referenced record does not exist.';
    code = 'FOREIGN_KEY_VIOLATION';
  }
  if (err.code === '23502') {
    statusCode = 400;
    message = 'Required field is missing.';
    code = 'NOT_NULL_VIOLATION';
  }

  // Production vs Development responses
  const isDev = process.env.NODE_ENV !== 'production';

  res.status(statusCode).json({
    success: false,
    error: message,
    code,
    ...(isDev && {
      stack: err.stack,
      details: err.details,
    }),
  });
}

module.exports = {
  AppError,
  notFoundHandler,
  globalErrorHandler,
};
