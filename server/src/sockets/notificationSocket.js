// Cross-cutting notification socket — alerts, warnings, system messages
// SOP §16.1: Session Alerts, §13.2: Low Stock Alerts, §10.4: Cash Mismatch
const logger = require('../utils/logger');

module.exports = function setupNotificationSocket(io, namespace) {
  const nsp = io.of(namespace);

  nsp.on('connection', (socket) => {
    logger.debug(`Notification socket connected: ${socket.user?.name}`);

    // SOP §8.3: Reserved PC conflict alert
    socket.on('alert:reservation_conflict', (data) => {
      const room = `branch:${data.branchId}`;
      nsp.to(room).emit('alert:reservation_conflict', data);
    });

    // SOP §16.1: Long session warning
    socket.on('alert:long_session', (data) => {
      const room = `branch:${data.branchId}`;
      nsp.to(room).emit('alert:long_session', data);
      nsp.to('admin:all').emit('alert:long_session', data);
    });

    // SOP §13.2: Low stock alert
    socket.on('alert:low_stock', (data) => {
      const room = `branch:${data.branchId}`;
      nsp.to(room).emit('alert:low_stock', data);
      nsp.to('admin:all').emit('alert:low_stock', data);
    });

    // SOP §10.4: Cash mismatch alert
    socket.on('alert:cash_mismatch', (data) => {
      nsp.to('admin:all').emit('alert:cash_mismatch', data);
    });

    // SOP §16.1: Billing pending alert
    socket.on('alert:pending_bill', (data) => {
      const room = `branch:${data.branchId}`;
      nsp.to(room).emit('alert:pending_bill', data);
    });

    // SOP §11: Forced logout notification to specific user
    socket.on('alert:force_logout', (data) => {
      nsp.to(`user:${data.operatorId}`).emit('alert:force_logout', data);
    });

    // Session expiry warning
    socket.on('alert:session_expiry', (data) => {
      const room = `branch:${data.branchId}`;
      nsp.to(room).emit('alert:session_expiry', data);
      // Also notify user panel
      if (data.userId) {
        nsp.to(`user:${data.userId}`).emit('alert:session_expiry', data);
      }
    });
  });
};
