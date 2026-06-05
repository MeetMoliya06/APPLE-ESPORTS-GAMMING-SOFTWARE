// SOP §12: Food Orders — Real-time food order sync
const logger = require('../utils/logger');

module.exports = function setupFoodOrderSocket(io, namespace) {
  const nsp = io.of(namespace);

  nsp.on('connection', (socket) => {
    logger.debug(`Food order socket connected: ${socket.user?.name}`);

    socket.on('food:ordered', (data) => {
      const room = `branch:${data.branchId}`;
      nsp.to(room).emit('food:ordered', data);
    });

    socket.on('food:preparing', (data) => {
      const room = `branch:${data.branchId}`;
      nsp.to(room).emit('food:preparing', data);
    });

    socket.on('food:ready', (data) => {
      const room = `branch:${data.branchId}`;
      nsp.to(room).emit('food:ready', data);
      // Also notify the specific user panel
      if (data.pcId) {
        nsp.to(`user:${data.pcId}`).emit('food:ready', data);
      }
    });

    socket.on('food:delivered', (data) => {
      const room = `branch:${data.branchId}`;
      nsp.to(room).emit('food:delivered', data);
    });

    socket.on('food:cancelled', (data) => {
      const room = `branch:${data.branchId}`;
      nsp.to(room).emit('food:cancelled', data);
    });
  });
};
