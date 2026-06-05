// ═══════════════════════════════════════════════════════════
// Gaming Café ERP — Request Validation Middleware
// SOP §21.2: NEVER TRUST FRONTEND — validate everything
// ═══════════════════════════════════════════════════════════

const { validationResult, body, param, query: queryValidator } = require('express-validator');

/**
 * Process validation results and return structured errors
 */
function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
      value: err.value,
    }));

    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: formattedErrors,
    });
  }
  next();
}

/**
 * Pre-built validation chains for common auth operations
 */
const authValidators = {
  // Super Admin Login — SOP §6.2
  adminLogin: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    handleValidationErrors,
  ],

  // Operator Login — SOP §6.3
  operatorLogin: [
    body('branchId')
      .isUUID()
      .withMessage('Valid branch ID is required'),
    body('username')
      .trim()
      .notEmpty()
      .withMessage('Username is required'),
    body('password')
      .notEmpty()
      .withMessage('Password or PIN is required'),
    handleValidationErrors,
  ],

  // Token Refresh
  refreshToken: [
    body('refreshToken')
      .notEmpty()
      .withMessage('Refresh token is required'),
    handleValidationErrors,
  ],
};

/**
 * Common validation chains for reusable patterns
 */
const commonValidators = {
  // UUID parameter validation
  uuidParam: (paramName = 'id') => [
    param(paramName)
      .isUUID()
      .withMessage(`Valid ${paramName} is required`),
    handleValidationErrors,
  ],

  // Pagination query validation
  pagination: [
    queryValidator('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    queryValidator('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    handleValidationErrors,
  ],

  // Branch ID in query (for Super Admin branch switching)
  branchQuery: [
    queryValidator('branch_id')
      .optional()
      .isUUID()
      .withMessage('Valid branch_id is required'),
    handleValidationErrors,
  ],

  // Date range filter
  dateRange: [
    queryValidator('start_date')
      .optional()
      .isISO8601()
      .withMessage('start_date must be a valid ISO date'),
    queryValidator('end_date')
      .optional()
      .isISO8601()
      .withMessage('end_date must be a valid ISO date'),
    handleValidationErrors,
  ],
};

/**
 * Operator management validators (SOP §7: Settings Dashboard)
 */
const operatorValidators = {
  create: [
    body('fullName')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Full name must be 2-100 characters'),
    body('username')
      .trim()
      .isLength({ min: 3, max: 50 })
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username must be 3-50 alphanumeric characters'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('mobileNumber')
      .optional()
      .matches(/^[0-9]{10}$/)
      .withMessage('Mobile number must be 10 digits'),
    body('branchId')
      .isUUID()
      .withMessage('Valid branch ID is required'),
    body('dashboardPermissions')
      .optional()
      .isObject()
      .withMessage('Dashboard permissions must be an object'),
    handleValidationErrors,
  ],
};

/**
 * Session validators (SOP §7.2: Session Start Flow)
 */
const sessionValidators = {
  start: [
    body('pcId')
      .isUUID()
      .withMessage('Valid PC ID is required'),
    body('customerName')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Customer name must be under 100 characters'),
    body('durationMin')
      .optional()
      .isInt({ min: 15, max: 1440 })
      .withMessage('Duration must be between 15 and 1440 minutes'),
    body('gamingType')
      .optional()
      .isIn(['standard', 'premium', 'vip'])
      .withMessage('Gaming type must be standard, premium, or vip'),
    handleValidationErrors,
  ],
};

/**
 * Payment validators (SOP §9.4: Split Payment Logic)
 */
const paymentValidators = {
  processPayment: [
    body('billId')
      .isUUID()
      .withMessage('Valid bill ID is required'),
    body('paymentType')
      .isIn(['cash', 'online', 'split', 'wallet'])
      .withMessage('Payment type must be cash, online, split, or wallet'),
    body('cashAmount')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Cash amount must be non-negative'),
    body('onlineAmount')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Online amount must be non-negative'),
    body('cashReceived')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Cash received must be non-negative'),
    handleValidationErrors,
  ],
};

/**
 * Member validators (SOP §7: Member Creation)
 */
const memberValidators = {
  create: [
    body('fullName')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Full name must be 2-100 characters'),
    body('mobileNumber')
      .matches(/^[0-9]{10}$/)
      .withMessage('Mobile number must be 10 digits'),
    body('email')
      .optional()
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email required'),
    handleValidationErrors,
  ],
  walletRecharge: [
    body('memberId')
      .isUUID()
      .withMessage('Valid member ID is required'),
    body('amount')
      .isFloat({ min: 1 })
      .withMessage('Recharge amount must be positive'),
    body('paymentType')
      .isIn(['cash', 'online', 'split'])
      .withMessage('Payment type must be cash, online, or split'),
    body('cashAmount')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Cash amount must be non-negative'),
    body('onlineAmount')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Online amount must be non-negative'),
    handleValidationErrors,
  ],
};

module.exports = {
  handleValidationErrors,
  authValidators,
  commonValidators,
  operatorValidators,
  sessionValidators,
  paymentValidators,
  memberValidators,
};
