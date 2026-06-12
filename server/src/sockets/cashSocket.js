// SOP §10/§11: Cash Register + Cash Desk — Real-time cash sync
const logger = require('../utils/logger');

module.exports = function setupCashSocket(io, namespace) {
  const nsp = io.of(namespace);

  nsp.on('connection', (socket) => {
    logger.debug(`Cash socket connected: ${socket.user?.name}`);

    socket.on('cash:transaction', (data) => {
      const room = `branch:${data.branchId}`;
      nsp.to(room).emit('cash:transaction', data);
      nsp.to('admin:all').emit('cash:transaction', data);
    });

    socket.on('cash:drawer_updated', (data) => {
      const room = `branch:${data.branchId}`;
      nsp.to(room).emit('cash:drawer_updated', data);
      nsp.to('admin:all').emit('cash:drawer_updated', data);
    });

    // SOP §10.4: Mismatch detection broadcasts to admin immediately
    socket.on('cash:mismatch_detected', (data) => {
      const room = `branch:${data.branchId}`;
      nsp.to(room).emit('cash:mismatch_detected', data);
      nsp.to('admin:all').emit('cash:mismatch_detected', data);
    });
  });
};
