// ═══════════════════════════════════════════════════════════
// Gaming Café ERP — Authentication Controller
// SOP §6: Complete Login System
// ═══════════════════════════════════════════════════════════

const authService = require('../services/auth.service');
const logger = require('../utils/logger');

/**
 * POST /api/auth/admin/login
 * SOP §6.2: Super Admin Login Flow
 */
async function adminLogin(req, res, next) {
  try {
    const { email, password } = req.body;
    const deviceInfo = {
      userAgent: req.headers['user-agent'],
      ip: req.ip,
      timestamp: new Date().toISOString(),
    };

    const result = await authService.loginAdmin(email, password, deviceInfo);

    res.status(200).json({
      success: true,
      message: 'Super Admin login successful',
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/operator/login
 * SOP §6.3: Operator Login Flow (Branch → Profile → PIN → Shift Start)
 */
async function operatorLogin(req, res, next) {
  try {
    const { branchId, username, password } = req.body;
    const deviceInfo = {
      userAgent: req.headers['user-agent'],
      ip: req.ip,
      timestamp: new Date().toISOString(),
    };

    const result = await authService.loginOperator(branchId, username, password, deviceInfo);

    res.status(200).json({
      success: true,
      message: 'Operator login successful. Shift started.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/logout
 * SOP §10: Shift closure on logout
 */
async function logout(req, res, next) {
  try {
    const result = await authService.logout(
      req.user.id,
      req.user.role,
      req.body.shiftId || req.user.shiftId
    );

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/force-logout
 * SOP §11: Live Access Revocation (Super Admin only)
 */
async function forceLogout(req, res, next) {
  try {
    const { operatorId } = req.body;
    const result = await authService.forceLogout(req.user.id, operatorId);

    res.status(200).json({
      success: true,
      message: `Operator ${result.operator} has been forcefully logged out`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */
async function refreshToken(req, res, next) {
  try {
    const { refreshToken: token } = req.body;
    const result = await authService.refreshAccessToken(token);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/auth/me
 * Get current authenticated user profile + permissions
 */
async function getMe(req, res, next) {
  try {
    const user = await authService.getCurrentUser(req.user.id, req.user.role);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/auth/branches
 * SOP §6.3 Step 2: Get active branches for operator login screen
 */
async function getBranches(req, res, next) {
  try {
    const branches = await authService.getActiveBranches();

    res.status(200).json({
      success: true,
      data: branches,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/auth/operators/:branchId
 * SOP §6.3 Step 3: Get operators for a specific branch
 */
async function getBranchOperators(req, res, next) {
  try {
    const operators = await authService.getBranchOperators(req.params.branchId);

    res.status(200).json({
      success: true,
      data: operators,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  adminLogin,
  operatorLogin,
  logout,
  forceLogout,
  refreshToken,
  getMe,
  getBranches,
  getBranchOperators,
};
