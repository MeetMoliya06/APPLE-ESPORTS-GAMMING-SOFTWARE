// ═══════════════════════════════════════════════════════════
// Gaming Café ERP — Authentication Routes
// SOP §6: Login System + §21: Security Model
// ═══════════════════════════════════════════════════════════

const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth');
const { authorize, superAdminOnly } = require('../middleware/roles');
const { authLimiter, strictLimiter } = require('../middleware/rateLimiter');
const { authValidators } = require('../middleware/validate');
const { ROLES } = require('../utils/constants');

// ── Public Routes (no auth required) ──

// Branch listing for operator login screen
// SOP §6.3 Step 2: Select Branch
router.get('/branches', authController.getBranches);

// Operator listing for a branch
// SOP §6.3 Step 3: Branch-specific operator board
router.get('/operators/:branchId', authController.getBranchOperators);

// Super Admin login
// SOP §6.2: Email + Password → Validate → Redirect to Admin Dashboard
router.post(
  '/admin/login',
  authLimiter,
  authValidators.adminLogin,
  authController.adminLogin
);

// Operator login
// SOP §6.3: Branch → Profile → PIN → Shift starts
router.post(
  '/operator/login',
  authLimiter,
  authValidators.operatorLogin,
  authController.operatorLogin
);

// Token refresh
router.post(
  '/refresh',
  authValidators.refreshToken,
  authController.refreshToken
);

// ── Protected Routes (auth required) ──

// Get current user profile + permissions
router.get('/me', authenticate, authController.getMe);

// Logout (closes shift for operators)
// SOP §10: Shift Handover — records logout time, summary, revenue
router.post('/logout', authenticate, authController.logout);

// Force logout an operator (Super Admin only)
// SOP §11: Live Access Revocation System
router.post(
  '/force-logout',
  authenticate,
  superAdminOnly,
  strictLimiter,
  authController.forceLogout
);

module.exports = router;
