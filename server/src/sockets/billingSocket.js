// SOP §9: Billing Counter — Real-time billing sync
const logger = require('../utils/logger');

module.exports = function setupBillingSocket(io, namespace) {
  const nsp = io.of(namespace);

  nsp.on('connection', (socket) => {
    logger.debug(`Billing socket connected: ${socket.user?.name}`);

    socket.on('bill:created', (data) => {
      const room = `branch:${data.branchId}`;
      nsp.to(room).emit('bill:created', data);
      nsp.to('admin:all').emit('bill:created', data);
    });

    socket.on('bill:updated', (data) => {
      const room = `branch:${data.branchId}`;
      nsp.to(room).emit('bill:updated', data);
      nsp.to('admin:all').emit('bill:updated', data);
    });

    socket.on('bill:completed', (data) => {
      const room = `branch:${data.branchId}`;
      nsp.to(room).emit('bill:completed', data);
      nsp.to('admin:all').emit('bill:completed', data);
    });

    socket.on('payment:processed', (data) => {
      const room = `branch:${data.branchId}`;
      nsp.to(room).emit('payment:processed', data);
      nsp.to('admin:all').emit('payment:processed', data);
    });
  });
};
