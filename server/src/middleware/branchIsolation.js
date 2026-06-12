// ═══════════════════════════════════════════════════════════
// Gaming Café ERP — Branch Isolation Middleware
// SOP §6.4: Operators can ONLY access THEIR ASSIGNED BRANCH
// SOP: Backend ALWAYS filters WHERE branch_id = operator_branch
// ═══════════════════════════════════════════════════════════

const { ROLES } = require('../utils/constants');
const logger = require('../utils/logger');

/**
 * Enforce branch isolation for all data queries
 * - Super Admin: can access any branch (or all branches)
 * - Operator: ONLY their assigned branch
 * - Attaches branchId to req for use in controllers/services
 */
function enforceBranchIsolation(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required',
      code: 'AUTH_REQUIRED',
    });
  }

  // Super Admin can access any branch
  // They may specify a branch via query param or header
  if (req.user.role === ROLES.SUPER_ADMIN) {
    req.branchId = req.query.branch_id || req.headers['x-branch-id'] || null;
    return next();
  }

  // Operator — enforce their assigned branch
  if (!req.user.branchId) {
    logger.error('Operator has no branch assignment', {
      operatorId: req.user.id,
    });
    return res.status(403).json({
      success: false,
      error: 'No branch assigned to this operator.',
      code: 'NO_BRANCH',
    });
  }

  // If operator tries to access another branch via params/query
  const requestedBranch = req.query.branch_id || req.params.branchId || req.body?.branch_id;
  if (requestedBranch && requestedBranch !== req.user.branchId) {
    logger.warn('Branch isolation violation attempt', {
      operatorId: req.user.id,
      assignedBranch: req.user.branchId,
      requestedBranch,
      path: req.path,
    });
    return res.status(403).json({
      success: false,
      error: 'Access denied. You can only access your assigned branch.',
      code: 'BRANCH_ISOLATION',
    });
  }

  // Lock branch to operator's assigned branch
  req.branchId = req.user.branchId;
  next();
}

module.exports = { enforceBranchIsolation };
