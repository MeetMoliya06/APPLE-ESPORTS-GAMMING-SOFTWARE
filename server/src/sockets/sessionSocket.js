// SOP §7: Session Engine — Real-time session state sync
const logger = require('../utils/logger');

module.exports = function setupSessionSocket(io, namespace) {
  const nsp = io.of(namespace);

  nsp.on('connection', (socket) => {
    logger.debug(`Session socket connected: ${socket.user?.name}`);

    // Session lifecycle events
    socket.on('session:start', (data) => {
      // Broadcast to branch room — SOP: updates all dashboards
      const room = `branch:${data.branchId}`;
      nsp.to(room).emit('session:started', data);
      nsp.to('admin:all').emit('session:started', data);
    });

    socket.on('session:stop', (data) => {
      const room = `branch:${data.branchId}`;
      nsp.to(room).emit('session:stopped', data);
      nsp.to('admin:all').emit('session:stopped', data);
    });

    socket.on('session:extend', (data) => {
      const room = `branch:${data.branchId}`;
      nsp.to(room).emit('session:extended', data);
      nsp.to('admin:all').emit('session:extended', data);
    });

    socket.on('session:transfer', (data) => {
      const room = `branch:${data.branchId}`;
      nsp.to(room).emit('session:transferred', data);
      nsp.to('admin:all').emit('session:transferred', data);
    });

    // Timer ticks (sent from server at intervals)
    socket.on('session:timer_sync', (data) => {
      const room = `branch:${data.branchId}`;
      nsp.to(room).emit('session:timer_update', data);
    });
  });
};
