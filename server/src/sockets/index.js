// ═══════════════════════════════════════════════════════════
// Gaming Café ERP — Socket Namespace Registry
// SOP §20.1: All dashboards require live synchronization
// ═══════════════════════════════════════════════════════════

const logger = require('../utils/logger');
const { SOCKET_NAMESPACES } = require('../utils/constants');

const setupSessionSocket = require('./sessionSocket');
const setupBillingSocket = require('./billingSocket');
const setupReservationSocket = require('./reservationSocket');
const setupPcStatusSocket = require('./pcStatusSocket');
const setupFoodOrderSocket = require('./foodOrderSocket');
const setupCashSocket = require('./cashSocket');
const setupNotificationSocket = require('./notificationSocket');

/**
 * Register all Socket.IO namespaces
 * Each namespace corresponds to an SOP synchronization target
 */
function setupNamespaces(io) {
  // SOP §7: Session state sync
  setupSessionSocket(io, SOCKET_NAMESPACES.SESSIONS);

  // SOP §9: Billing counter sync
  setupBillingSocket(io, SOCKET_NAMESPACES.BILLING);

  // SOP §8: Reservation state sync
  setupReservationSocket(io, SOCKET_NAMESPACES.RESERVATIONS);

  // SOP §17: PC state sync
  setupPcStatusSocket(io, SOCKET_NAMESPACES.PC_STATUS);

  // SOP §12: Food order sync
  setupFoodOrderSocket(io, SOCKET_NAMESPACES.FOOD_ORDERS);

  // SOP §10/§11: Cash register/desk sync
  setupCashSocket(io, SOCKET_NAMESPACES.CASH);

  // Cross-cutting alerts and notifications
  setupNotificationSocket(io, SOCKET_NAMESPACES.NOTIFICATIONS);

  logger.info('All socket namespaces registered', {
    namespaces: Object.values(SOCKET_NAMESPACES),
  });
}

module.exports = setupNamespaces;
