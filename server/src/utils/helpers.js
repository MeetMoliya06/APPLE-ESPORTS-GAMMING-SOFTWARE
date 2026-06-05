// ═══════════════════════════════════════════════════════════
// Gaming Café ERP — Utility Helpers
// ═══════════════════════════════════════════════════════════

const { v4: uuidv4 } = require('uuid');

/**
 * Generate unique ID with optional prefix
 * Used for: Bill IDs (BILL-xxxx), Order IDs (FOOD-xxxx), Session IDs
 */
function generateId(prefix = '') {
  const shortId = uuidv4().split('-')[0].toUpperCase();
  return prefix ? `${prefix}-${shortId}` : shortId;
}

/**
 * Format currency for Indian Rupees
 * SOP: All billing uses ₹ notation
 */
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Calculate change return
 * SOP §9.5 & §20A: Change Return System
 * Change calculation happens ONLY on remaining cash amount, NOT total bill
 */
function calculateChange(totalBill, onlineAmount, cashReceived) {
  const cashRequired = totalBill - (onlineAmount || 0);
  const change = cashReceived - cashRequired;
  return {
    totalBill,
    onlineAmount: onlineAmount || 0,
    cashRequired,
    cashReceived,
    changeReturn: Math.max(0, change),
    actualCashCollected: Math.min(cashReceived, cashRequired),
    isInsufficient: change < 0,
    shortfall: change < 0 ? Math.abs(change) : 0,
    isExact: change === 0,
  };
}

/**
 * Calculate expected drawer cash
 * SOP §10.3: Expected Drawer Cash = Opening + Cash Sales + Split Cash Portion
 */
function calculateExpectedDrawerCash(openingBalance, cashTransactions) {
  const totalCashCollected = cashTransactions.reduce(
    (sum, txn) => sum + (txn.actualCashCollected || 0),
    0
  );
  return openingBalance + totalCashCollected;
}

/**
 * Detect cash mismatch
 * SOP §19 & §20: Mismatch Detection
 */
function detectCashMismatch(expectedCash, actualCash) {
  const difference = actualCash - expectedCash;
  return {
    expectedCash,
    actualCash,
    difference,
    isMatch: difference === 0,
    isExcess: difference > 0,
    isShort: difference < 0,
  };
}

/**
 * Calculate denomination total
 * SOP §11.1: Denomination Counter
 */
function calculateDenominationTotal(denominations) {
  return Object.entries(denominations).reduce(
    (total, [denomination, count]) => total + parseInt(denomination, 10) * (count || 0),
    0
  );
}

/**
 * Format duration from milliseconds
 */
function formatDuration(ms) {
  const totalMinutes = Math.floor(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes}m`;
  return `${hours}h ${minutes}m`;
}

/**
 * Get current IST timestamp
 * SOP: All timestamps must be exact date + time
 */
function getCurrentTimestamp() {
  return new Date().toISOString();
}

/**
 * Validate split payment
 * SOP §9.4: Cash + Online MUST equal total bill
 */
function validateSplitPayment(totalBill, cashAmount, onlineAmount) {
  const total = (cashAmount || 0) + (onlineAmount || 0);
  return {
    isValid: Math.abs(total - totalBill) < 0.01,
    totalProvided: total,
    totalRequired: totalBill,
    difference: total - totalBill,
  };
}

/**
 * Sanitize user input string
 */
function sanitizeString(str) {
  if (typeof str !== 'string') return '';
  return str.trim().replace(/[<>]/g, '');
}

/**
 * Paginate query results
 */
function getPagination(page = 1, limit = 20) {
  const safePage = Math.max(1, parseInt(page, 10) || 1);
  const safeLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const offset = (safePage - 1) * safeLimit;
  return { page: safePage, limit: safeLimit, offset };
}

module.exports = {
  generateId,
  formatCurrency,
  calculateChange,
  calculateExpectedDrawerCash,
  detectCashMismatch,
  calculateDenominationTotal,
  formatDuration,
  getCurrentTimestamp,
  validateSplitPayment,
  sanitizeString,
  getPagination,
};
