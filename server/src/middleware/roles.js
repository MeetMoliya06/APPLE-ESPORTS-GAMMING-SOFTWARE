// ═══════════════════════════════════════════════════════════
// Gaming Café ERP — Role-Based Access Control (RBAC)
// SOP §5: Role Hierarchy — Super Admin > Operator > User Panel
// SOP §19.2: Dashboard Permission Control per operator
// ═══════════════════════════════════════════════════════════

const { ROLES, ADMIN_ONLY_DASHBOARDS } = require('../utils/constants');
const logger = require('../utils/logger');

/**
 * Restrict access to specific roles
 * Usage: authorize(ROLES.SUPER_ADMIN) or authorize(ROLES.SUPER_ADMIN, ROLES.OPERATOR)
 */
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'AUTH_REQUIRED',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      logger.warn('Unauthorized access attempt', {
        userId: req.user.id,
        role: req.user.role,
        requiredRoles: allowedRoles,
        path: req.path,
      });
      return res.status(403).json({
        success: false,
        error: 'Access denied. Insufficient permissions.',
        code: 'FORBIDDEN',
      });
    }

    next();
  };
}

/**
 * Super Admin only access
 * SOP: Settings, PC Status, Audit Logs = Super Admin ONLY
 */
function superAdminOnly(req, res, next) {
  return authorize(ROLES.SUPER_ADMIN)(req, res, next);
}

/**
 * Check operator has specific dashboard permission
 * SOP §19.2: Super Admin can grant/revoke dashboard access per operator
 */
function requireDashboardAccess(dashboardKey) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'AUTH_REQUIRED',
      });
    }

    // Super Admin always has full access
    if (req.user.role === ROLES.SUPER_ADMIN) {
      return next();
    }

    // Check if dashboard is admin-only
    if (ADMIN_ONLY_DASHBOARDS.includes(dashboardKey)) {
      logger.warn('Operator attempted admin-only dashboard access', {
        operatorId: req.user.id,
        dashboard: dashboardKey,
      });
      return res.status(403).json({
        success: false,
        error: 'This dashboard is restricted to Super Admin.',
        code: 'ADMIN_ONLY',
      });
    }

    // Check operator's dashboard permissions
    const permissions = req.user.dashboardPermissions;
    if (!permissions || !permissions[dashboardKey]) {
      logger.warn('Dashboard permission denied', {
        operatorId: req.user.id,
        dashboard: dashboardKey,
        permissions,
      });
      return res.status(403).json({
        success: false,
        error: `Access to ${dashboardKey} is not permitted.`,
        code: 'DASHBOARD_RESTRICTED',
      });
    }

    next();
  };
}

module.exports = {
  authorize,
  superAdminOnly,
  requireDashboardAccess,
};
