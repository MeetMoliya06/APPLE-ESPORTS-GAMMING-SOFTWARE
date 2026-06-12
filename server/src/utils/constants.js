// ═══════════════════════════════════════════════════════════
// Gaming Café ERP — System Constants
// All constants derived from MASTER SOP
// ═══════════════════════════════════════════════════════════

/**
 * SOP §5: Role Hierarchy
 * 3 main access layers
 */
const ROLES = Object.freeze({
  SUPER_ADMIN: 'super_admin',
  OPERATOR: 'operator',
  USER_PANEL: 'user_panel',
});

/**
 * SOP §7.1: Session/PC States
 * Visual Status Colors: Green=Active, Purple=Reserved, Orange=Awaiting, Gray=Idle, Red=Offline
 */
const PC_STATES = Object.freeze({
  IDLE: 'idle',
  ACTIVE: 'active',
  RESERVED: 'reserved',
  AWAITING_BILLING: 'awaiting_billing',
  OFFLINE: 'offline',
});

/**
 * SOP §8: Session States (lifecycle)
 */
const SESSION_STATES = Object.freeze({
  ACTIVE: 'active',
  RESERVED: 'reserved',
  AWAITING_BILLING: 'awaiting_billing',
  COMPLETED: 'completed',
  EXPIRED: 'expired',
});

/**
 * SOP §9.3: Payment Methods
 */
const PAYMENT_TYPES = Object.freeze({
  CASH: 'cash',
  ONLINE: 'online',
  SPLIT: 'split',
  WALLET: 'wallet',
});

/**
 * SOP §12.1: Food Order States
 */
const ORDER_STATUSES = Object.freeze({
  PENDING: 'pending',
  PREPARING: 'preparing',
  READY: 'ready',
  DELIVERED: 'delivered',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
});

/**
 * SOP §6: Member Status Types
 */
const MEMBER_STATUSES = Object.freeze({
  ACTIVE: 'active',
  VIP: 'vip',
  SUSPENDED: 'suspended',
  INACTIVE: 'inactive',
});

/**
 * SOP §12: Operator Status
 */
const OPERATOR_STATUSES = Object.freeze({
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  DISABLED: 'disabled',
  LOGGED_OUT: 'logged_out',
});

/**
 * SOP §16: Food Availability Status
 */
const FOOD_AVAILABILITY = Object.freeze({
  AVAILABLE: 'available',
  OUT_OF_STOCK: 'out_of_stock',
  DISABLED: 'disabled',
});

/**
 * SOP §19: Dashboards that can be permission-controlled
 */
const DASHBOARDS = Object.freeze({
  BILLING_COUNTER: 'billing_counter',
  SESSIONS: 'sessions',
  RESERVATIONS: 'reservations',
  FOOD_ORDERS: 'food_orders',
  CASH_REGISTER: 'cash_register',
  CASH_DESK: 'cash_desk',
  MEMBERS: 'members',
  MENU_EDITOR: 'menu_editor',
  MAIN_DASHBOARD: 'main_dashboard',
  PC_STATUS: 'pc_status',
  EOD: 'eod',
  SETTINGS: 'settings',
});

/**
 * SOP §19: Super Admin-only dashboards
 */
const ADMIN_ONLY_DASHBOARDS = Object.freeze([
  DASHBOARDS.PC_STATUS,
  DASHBOARDS.SETTINGS,
]);

/**
 * SOP §9.6/§25: Discount Types (Admin only)
 */
const DISCOUNT_TYPES = Object.freeze({
  FLAT: 'flat',
  PERCENTAGE: 'percentage',
  COUPON: 'coupon',
});

/**
 * SOP §11.1: Cash Denomination Values (Indian Rupees)
 */
const DENOMINATIONS = Object.freeze([
  2000, 500, 200, 100, 50, 20, 10, 5, 2, 1,
]);

/**
 * SOP §15A: Wallet Transaction Types
 */
const WALLET_ACTIONS = Object.freeze({
  RECHARGE: 'recharge',
  DEDUCTION_GAMING: 'deduction_gaming',
  DEDUCTION_FOOD: 'deduction_food',
  CORRECTION: 'correction',
  REWARD_REDEMPTION: 'reward_redemption',
});

/**
 * SOP §22: Audit Action Types
 */
const AUDIT_ACTIONS = Object.freeze({
  // Auth
  LOGIN: 'login',
  LOGOUT: 'logout',
  FAILED_LOGIN: 'failed_login',
  FORCED_LOGOUT: 'forced_logout',

  // Sessions
  SESSION_START: 'session_start',
  SESSION_STOP: 'session_stop',
  SESSION_EXTEND: 'session_extend',
  SESSION_TRANSFER: 'session_transfer',

  // Reservations
  RESERVATION_CREATE: 'reservation_create',
  RESERVATION_CANCEL: 'reservation_cancel',
  RESERVATION_OVERRIDE: 'reservation_override',
  RESERVATION_EXPIRE: 'reservation_expire',

  // Billing
  BILL_CREATE: 'bill_create',
  BILL_COMPLETE: 'bill_complete',
  PAYMENT_PROCESS: 'payment_process',
  DISCOUNT_APPLY: 'discount_apply',

  // Cash
  CASH_OPENING: 'cash_opening',
  CASH_VERIFICATION: 'cash_verification',
  CASH_MISMATCH: 'cash_mismatch',
  DENOMINATION_COUNT: 'denomination_count',

  // Members
  MEMBER_CREATE: 'member_create',
  WALLET_RECHARGE: 'wallet_recharge',
  WALLET_DEDUCTION: 'wallet_deduction',
  POINTS_REDEEM: 'points_redeem',

  // Operators
  OPERATOR_CREATE: 'operator_create',
  OPERATOR_REMOVE: 'operator_remove',
  OPERATOR_SUSPEND: 'operator_suspend',
  ACCESS_GRANT: 'access_grant',
  ACCESS_REVOKE: 'access_revoke',

  // Inventory
  STOCK_REFILL: 'stock_refill',
  PRICE_CHANGE: 'price_change',
  ITEM_DISABLE: 'item_disable',
  WASTAGE_LOG: 'wastage_log',

  // System
  SHIFT_START: 'shift_start',
  SHIFT_END: 'shift_end',
  EOD_FINALIZE: 'eod_finalize',
  FORCE_CLOSE: 'force_close',
  SETTINGS_CHANGE: 'settings_change',
});

/**
 * Socket.IO Event Namespaces
 * SOP §20: Real-Time Synchronization
 */
const SOCKET_NAMESPACES = Object.freeze({
  SESSIONS: '/sessions',
  BILLING: '/billing',
  RESERVATIONS: '/reservations',
  FOOD_ORDERS: '/food-orders',
  PC_STATUS: '/pc-status',
  CASH: '/cash',
  NOTIFICATIONS: '/notifications',
});

module.exports = {
  ROLES,
  PC_STATES,
  SESSION_STATES,
  PAYMENT_TYPES,
  ORDER_STATUSES,
  MEMBER_STATUSES,
  OPERATOR_STATUSES,
  FOOD_AVAILABILITY,
  DASHBOARDS,
  ADMIN_ONLY_DASHBOARDS,
  DISCOUNT_TYPES,
  DENOMINATIONS,
  WALLET_ACTIONS,
  AUDIT_ACTIONS,
  SOCKET_NAMESPACES,
};
