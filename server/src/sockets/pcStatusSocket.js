// SOP §17: PC Status — Real-time PC state sync
const logger = require('../utils/logger');

module.exports = function setupPcStatusSocket(io, namespace) {
  const nsp = io.of(namespace);

  nsp.on('connection', (socket) => {
    logger.debug(`PC Status socket connected: ${socket.user?.name}`);

    socket.on('pc:state_changed', (data) => {
      const room = `branch:${data.branchId}`;
      nsp.to(room).emit('pc:state_changed', data);
      nsp.to('admin:all').emit('pc:state_changed', data);
    });

    socket.on('pc:offline', (data) => {
      const room = `branch:${data.branchId}`;
      nsp.to(room).emit('pc:offline', data);
      nsp.to('admin:all').emit('pc:offline', data);
    });

    socket.on('pc:online', (data) => {
      const room = `branch:${data.branchId}`;
      nsp.to(room).emit('pc:online', data);
      nsp.to('admin:all').emit('pc:online', data);
    });
  });
};
