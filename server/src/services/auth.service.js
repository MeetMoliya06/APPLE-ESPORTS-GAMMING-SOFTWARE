// ═══════════════════════════════════════════════════════════
// Gaming Café ERP — Authentication Service
// SOP §6: Login System (Admin + Operator flows)
// SOP §21: Security Model (hashing, tokens, device tracking)
// SOP §10: Shift Management (auto shift start on login)
// ═══════════════════════════════════════════════════════════

const bcrypt = require('bcryptjs');
const { query, transaction } = require('../config/database');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../middleware/auth');
const { logAudit } = require('../middleware/audit');
const { ROLES, AUDIT_ACTIONS } = require('../utils/constants');
const logger = require('../utils/logger');
const { AppError } = require('../middleware/errorHandler');

const SALT_ROUNDS = 12;

/**
 * Hash a password
 * SOP §21.1: Password Hashing = YES
 */
async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compare password with hash
 */
async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

/**
 * Super Admin Login
 * SOP §6.2: Email/Password → Validate credentials, permissions, device, account status
 * SOP: Super Admin session should persist until logout/timeout/password reset/forced signout
 */
async function loginAdmin(email, password, deviceInfo) {
  // 1. Find admin user
  const result = await query(
    'SELECT id, email, password_hash, full_name, role, status FROM users WHERE email = $1',
    [email]
  );

  if (result.rows.length === 0) {
    throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  const user = result.rows[0];

  // 2. Check account status
  if (user.status !== 'active') {
    throw new AppError(`Account is ${user.status}. Contact system administrator.`, 403, 'ACCOUNT_INACTIVE');
  }

  // 3. Verify password
  const isValid = await comparePassword(password, user.password_hash);
  if (!isValid) {
    // Log failed attempt — SOP §22: Audit every critical action
    await logAudit({
      userId: user.id,
      userRole: ROLES.SUPER_ADMIN,
      userName: user.full_name,
      action: AUDIT_ACTIONS.FAILED_LOGIN,
      details: { reason: 'Invalid password', deviceInfo },
    });
    throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  // 4. Generate tokens
  const tokenPayload = {
    id: user.id,
    role: ROLES.SUPER_ADMIN,
    name: user.full_name,
  };

  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  // 5. Update last login + device info — SOP §21.1: Device Tracking
  await query(
    'UPDATE users SET last_login = NOW(), device_info = $1 WHERE id = $2',
    [JSON.stringify(deviceInfo || {}), user.id]
  );

  // 6. Audit log — SOP §22
  await logAudit({
    userId: user.id,
    userRole: ROLES.SUPER_ADMIN,
    userName: user.full_name,
    action: AUDIT_ACTIONS.LOGIN,
    details: { method: 'email_password', deviceInfo },
  });

  logger.info(`Super Admin logged in: ${user.full_name}`);

  return {
    user: {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      role: ROLES.SUPER_ADMIN,
    },
    accessToken,
    refreshToken,
  };
}

/**
 * Operator Login
 * SOP §6.3: Select Branch → Select Profile → Enter PIN → System starts shift
 * SOP: Operator CANNOT see other branch data (enforced via branch assignment check)
 */
async function loginOperator(branchId, username, password, deviceInfo) {
  // 1. Verify branch exists and is active
  const branchResult = await query(
    'SELECT id, name, status FROM branches WHERE id = $1',
    [branchId]
  );

  if (branchResult.rows.length === 0) {
    throw new AppError('Branch not found', 404, 'BRANCH_NOT_FOUND');
  }

  const branch = branchResult.rows[0];
  if (branch.status !== 'active') {
    throw new AppError('Branch is currently inactive', 403, 'BRANCH_INACTIVE');
  }

  // 2. Find operator assigned to this branch
  const operatorResult = await query(
    `SELECT id, full_name, username, password_hash, branch_id, status, dashboard_permissions 
     FROM operators WHERE username = $1 AND branch_id = $2`,
    [username, branchId]
  );

  if (operatorResult.rows.length === 0) {
    throw new AppError('Invalid credentials or operator not assigned to this branch', 401, 'INVALID_CREDENTIALS');
  }

  const operator = operatorResult.rows[0];

  // 3. Check operator status — SOP §12: Operator Status Types
  if (operator.status === 'suspended') {
    throw new AppError('Operator account is suspended. Contact Super Admin.', 403, 'OPERATOR_SUSPENDED');
  }
  if (operator.status === 'disabled') {
    throw new AppError('Operator account is disabled. Contact Super Admin.', 403, 'OPERATOR_DISABLED');
  }

  // 4. Verify password/PIN
  const isValid = await comparePassword(password, operator.password_hash);
  if (!isValid) {
    await logAudit({
      operatorId: operator.id,
      userRole: ROLES.OPERATOR,
      userName: operator.full_name,
      action: AUDIT_ACTIONS.FAILED_LOGIN,
      branchId,
      branchName: branch.name,
      details: { reason: 'Invalid password/PIN', deviceInfo },
    });
    throw new AppError('Invalid password or PIN', 401, 'INVALID_CREDENTIALS');
  }

  // 5. Start shift — SOP §5: Shift Start (log operator, branch, login time, device)
  const shiftResult = await query(
    `INSERT INTO shifts (operator_id, branch_id, device_info, status)
     VALUES ($1, $2, $3, 'active')
     RETURNING id, login_time`,
    [operator.id, branchId, JSON.stringify(deviceInfo || {})]
  );

  const shift = shiftResult.rows[0];

  // 6. Update operator status to active
  await query(
    'UPDATE operators SET status = $1, last_login = NOW(), device_info = $2 WHERE id = $3',
    ['active', JSON.stringify(deviceInfo || {}), operator.id]
  );

  // 7. Generate tokens with branch + permissions embedded
  const tokenPayload = {
    id: operator.id,
    role: ROLES.OPERATOR,
    name: operator.full_name,
    branchId: operator.branch_id,
    shiftId: shift.id,
    dashboardPermissions: operator.dashboard_permissions,
  };

  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  // 8. Audit log
  await logAudit({
    operatorId: operator.id,
    userRole: ROLES.OPERATOR,
    userName: operator.full_name,
    action: AUDIT_ACTIONS.LOGIN,
    branchId,
    branchName: branch.name,
    details: {
      shiftId: shift.id,
      loginTime: shift.login_time,
      deviceInfo,
    },
  });

  // 9. Shift start audit
  await logAudit({
    operatorId: operator.id,
    userRole: ROLES.OPERATOR,
    userName: operator.full_name,
    action: AUDIT_ACTIONS.SHIFT_START,
    branchId,
    branchName: branch.name,
    details: { shiftId: shift.id },
  });

  logger.info(`Operator logged in: ${operator.full_name} @ ${branch.name}`);

  return {
    user: {
      id: operator.id,
      fullName: operator.full_name,
      username: operator.username,
      role: ROLES.OPERATOR,
      branchId: operator.branch_id,
      branchName: branch.name,
      shiftId: shift.id,
      dashboardPermissions: operator.dashboard_permissions,
    },
    accessToken,
    refreshToken,
  };
}

/**
 * Logout — closes shift for operators
 * SOP §10: Shift Handover — system records logout time, shift summary, revenue, actions
 */
async function logout(userId, role, shiftId) {
  if (role === ROLES.OPERATOR && shiftId) {
    // Close the operator's shift
    await query(
      `UPDATE shifts SET 
        logout_time = NOW(), 
        status = 'completed'
       WHERE id = $1 AND operator_id = $2 AND status = 'active'`,
      [shiftId, userId]
    );

    // Update operator status
    await query(
      "UPDATE operators SET status = 'logged_out' WHERE id = $1",
      [userId]
    );

    logger.info(`Operator shift ended: ${userId}, shift: ${shiftId}`);
  }

  // Fetch user name for audit
  let userName = 'Unknown';
  if (role === ROLES.SUPER_ADMIN) {
    const result = await query('SELECT full_name FROM users WHERE id = $1', [userId]);
    userName = result.rows[0]?.full_name || 'Admin';
  } else {
    const result = await query('SELECT full_name FROM operators WHERE id = $1', [userId]);
    userName = result.rows[0]?.full_name || 'Operator';
  }

  await logAudit({
    userId: role === ROLES.SUPER_ADMIN ? userId : null,
    operatorId: role === ROLES.OPERATOR ? userId : null,
    userRole: role,
    userName,
    action: AUDIT_ACTIONS.LOGOUT,
    details: { shiftId },
  });

  return { success: true };
}

/**
 * Force Logout — Super Admin forcibly logs out an operator
 * SOP §11: Live Access Revocation — instantly revoke access, terminate session, block future login
 */
async function forceLogout(adminId, operatorId) {
  // Get operator info
  const opResult = await query(
    `SELECT o.id, o.full_name, o.branch_id, b.name as branch_name
     FROM operators o JOIN branches b ON o.branch_id = b.id
     WHERE o.id = $1`,
    [operatorId]
  );

  if (opResult.rows.length === 0) {
    throw new AppError('Operator not found', 404, 'OPERATOR_NOT_FOUND');
  }

  const operator = opResult.rows[0];

  // Close all active shifts for this operator
  await query(
    `UPDATE shifts SET logout_time = NOW(), status = 'force_closed' 
     WHERE operator_id = $1 AND status = 'active'`,
    [operatorId]
  );

  // Set operator status to logged_out
  await query(
    "UPDATE operators SET status = 'logged_out' WHERE id = $1",
    [operatorId]
  );

  // Get admin name for audit
  const adminResult = await query('SELECT full_name FROM users WHERE id = $1', [adminId]);
  const adminName = adminResult.rows[0]?.full_name || 'Admin';

  // Audit log — SOP §22
  await logAudit({
    userId: adminId,
    userRole: ROLES.SUPER_ADMIN,
    userName: adminName,
    action: AUDIT_ACTIONS.FORCED_LOGOUT,
    targetType: 'operator',
    targetId: operatorId,
    branchId: operator.branch_id,
    branchName: operator.branch_name,
    details: {
      operatorName: operator.full_name,
      reason: 'Forced logout by Super Admin',
    },
  });

  logger.warn(`FORCE LOGOUT: ${operator.full_name} by ${adminName}`);

  return {
    success: true,
    operator: operator.full_name,
  };
}

/**
 * Refresh access token
 */
async function refreshAccessToken(refreshTokenStr) {
  try {
    const decoded = verifyRefreshToken(refreshTokenStr);

    // Re-verify user still exists and is active
    let userActive = false;
    if (decoded.role === ROLES.SUPER_ADMIN) {
      const result = await query("SELECT status FROM users WHERE id = $1 AND status = 'active'", [decoded.id]);
      userActive = result.rows.length > 0;
    } else if (decoded.role === ROLES.OPERATOR) {
      const result = await query("SELECT status FROM operators WHERE id = $1 AND status = 'active'", [decoded.id]);
      userActive = result.rows.length > 0;
    }

    if (!userActive) {
      throw new AppError('Account is no longer active', 403, 'ACCOUNT_INACTIVE');
    }

    // Generate new access token with same payload
    const tokenPayload = {
      id: decoded.id,
      role: decoded.role,
      name: decoded.name,
      branchId: decoded.branchId,
      shiftId: decoded.shiftId,
      dashboardPermissions: decoded.dashboardPermissions,
    };

    const newAccessToken = generateAccessToken(tokenPayload);

    return { accessToken: newAccessToken };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Invalid refresh token', 401, 'REFRESH_INVALID');
  }
}

/**
 * Get current user profile with permissions
 * SOP: Returns full dashboard permission map for frontend rendering
 */
async function getCurrentUser(userId, role) {
  if (role === ROLES.SUPER_ADMIN) {
    const result = await query(
      'SELECT id, email, full_name, role, status, last_login FROM users WHERE id = $1',
      [userId]
    );
    if (result.rows.length === 0) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }
    return {
      ...result.rows[0],
      role: ROLES.SUPER_ADMIN,
    };
  }

  if (role === ROLES.OPERATOR) {
    const result = await query(
      `SELECT o.id, o.full_name, o.username, o.branch_id, o.status, 
              o.dashboard_permissions, o.last_login,
              b.name as branch_name
       FROM operators o
       JOIN branches b ON o.branch_id = b.id
       WHERE o.id = $1`,
      [userId]
    );
    if (result.rows.length === 0) {
      throw new AppError('Operator not found', 404, 'OPERATOR_NOT_FOUND');
    }

    // Get active shift
    const shiftResult = await query(
      "SELECT id, login_time FROM shifts WHERE operator_id = $1 AND status = 'active' ORDER BY login_time DESC LIMIT 1",
      [userId]
    );

    return {
      ...result.rows[0],
      role: ROLES.OPERATOR,
      activeShift: shiftResult.rows[0] || null,
    };
  }

  throw new AppError('Invalid role', 400, 'INVALID_ROLE');
}

/**
 * Get operators for branch (for operator selection screen)
 * SOP §6.3 Step 3: Branch-specific operator board appears
 */
async function getBranchOperators(branchId) {
  const result = await query(
    `SELECT id, full_name, username, status 
     FROM operators 
     WHERE branch_id = $1 AND status != 'disabled'
     ORDER BY full_name`,
    [branchId]
  );
  return result.rows;
}

/**
 * Get all active branches (for branch selection screen)
 * SOP §6.3 Step 2: Select Branch
 */
async function getActiveBranches() {
  const result = await query(
    "SELECT id, name, address, status FROM branches WHERE status = 'active' ORDER BY name"
  );
  return result.rows;
}

module.exports = {
  hashPassword,
  comparePassword,
  loginAdmin,
  loginOperator,
  logout,
  forceLogout,
  refreshAccessToken,
  getCurrentUser,
  getBranchOperators,
  getActiveBranches,
};
