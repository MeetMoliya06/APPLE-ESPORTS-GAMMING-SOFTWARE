// ═══════════════════════════════════════════════════════════
// Gaming Café ERP — Audit Logging Middleware
// SOP §22: Every critical action MUST store user, action, 
//          target, branch, date, time, ip, device
// SOP: Audit logs are IMMUTABLE — READ ONLY after creation
// ═══════════════════════════════════════════════════════════

const { query } = require('../config/database');
const logger = require('../utils/logger');

/**
 * Log an audit event to the database
 * Called explicitly by controllers for critical actions
 */
async function logAudit({
  userId = null,
  operatorId = null,
  userRole,
  userName,
  action,
  targetType = null,
  targetId = null,
  branchId = null,
  branchName = null,
  details = null,
  ipAddress = null,
  deviceInfo = null,
}) {
  try {
    await query(
      `INSERT INTO audit_logs 
        (user_id, operator_id, user_role, user_name, action, target_type, target_id, 
         branch_id, branch_name, details, ip_address, device_info)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        userId,
        operatorId,
        userRole,
        userName,
        action,
        targetType,
        targetId,
        branchId,
        branchName,
        details ? JSON.stringify(details) : null,
        ipAddress,
        deviceInfo ? JSON.stringify(deviceInfo) : null,
      ]
    );

    logger.info(`AUDIT: ${action}`, {
      user: userName,
      role: userRole,
      target: targetType ? `${targetType}:${targetId}` : undefined,
      branch: branchName,
    });
  } catch (error) {
    // Audit logging failures should never block operations
    // but MUST be logged for investigation
    logger.error('AUDIT LOG FAILURE — CRITICAL', {
      action,
      userName,
      error: error.message,
    });
  }
}

/**
 * Express middleware — auto-attach audit helper to request
 * Controllers can call req.audit({ action, ... }) for convenience
 */
function auditMiddleware(req, res, next) {
  req.audit = async (auditData) => {
    const clientIp = req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress;
    const userAgent = req.headers['user-agent'];

    await logAudit({
      userId: req.user?.role === 'super_admin' ? req.user.id : null,
      operatorId: req.user?.role === 'operator' ? req.user.id : null,
      userRole: req.user?.role || 'unknown',
      userName: req.user?.name || 'System',
      branchId: req.branchId || req.user?.branchId,
      ipAddress: clientIp,
      deviceInfo: { userAgent },
      ...auditData,
    });
  };

  next();
}

module.exports = { logAudit, auditMiddleware };
