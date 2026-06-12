// SOP §8: Reservation System — Real-time reservation state sync
// SOP §8.2: Reservation MUST reflect in Billing Counter, Sessions, PC Status, Reservations Panel
const logger = require('../utils/logger');

module.exports = function setupReservationSocket(io, namespace) {
  const nsp = io.of(namespace);

  nsp.on('connection', (socket) => {
    logger.debug(`Reservation socket connected: ${socket.user?.name}`);

    socket.on('reservation:created', (data) => {
      const room = `branch:${data.branchId}`;
      nsp.to(room).emit('reservation:created', data);
      nsp.to('admin:all').emit('reservation:created', data);
    });

    socket.on('reservation:started', (data) => {
      const room = `branch:${data.branchId}`;
      nsp.to(room).emit('reservation:started', data);
      nsp.to('admin:all').emit('reservation:started', data);
    });

    socket.on('reservation:expired', (data) => {
      const room = `branch:${data.branchId}`;
      nsp.to(room).emit('reservation:expired', data);
      nsp.to('admin:all').emit('reservation:expired', data);
    });

    socket.on('reservation:cancelled', (data) => {
      const room = `branch:${data.branchId}`;
      nsp.to(room).emit('reservation:cancelled', data);
      nsp.to('admin:all').emit('reservation:cancelled', data);
    });
  });
};
