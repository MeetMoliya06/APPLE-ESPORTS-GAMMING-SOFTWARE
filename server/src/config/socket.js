// ═══════════════════════════════════════════════════════════
// Gaming Café ERP — Socket.IO Configuration
// SOP §20: Real-Time Synchronization Engine
// SOP §20.2: WebSockets + Socket.IO + Event-driven architecture
// ═══════════════════════════════════════════════════════════

const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { config } = require('./environment');
const logger = require('../utils/logger');
const { ROLES, SOCKET_NAMESPACES } = require('../utils/constants');

/**
 * Initialize Socket.IO server with authentication
 * SOP §21: NEVER TRUST FRONTEND — socket connections authenticated via JWT
 */
function initializeSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: config.socketCorsOrigin,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // ── Global Authentication Middleware ──
  // Every socket connection must present a valid JWT
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];

    if (!token) {
      logger.warn('Socket connection rejected: no token', {
        address: socket.handshake.address,
      });
      return next(new Error('Authentication required'));
    }

    try {
      const decoded = jwt.verify(token, config.jwt.secret);
      socket.user = {
        id: decoded.id,
        role: decoded.role,
        name: decoded.name,
        branchId: decoded.branchId || null,
        shiftId: decoded.shiftId || null,
      };

      // SOP §6.4: Branch isolation — operators join their branch room only
      if (decoded.role === ROLES.OPERATOR && decoded.branchId) {
        socket.branchRoom = `branch:${decoded.branchId}`;
      }

      next();
    } catch (error) {
      logger.warn('Socket connection rejected: invalid token', {
        address: socket.handshake.address,
        error: error.message,
      });
      return next(new Error('Invalid authentication token'));
    }
  });

  // ── Connection Handler ──
  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.user.name} (${socket.user.role})`, {
      socketId: socket.id,
      branchId: socket.user.branchId,
    });

    // Auto-join branch room for operators (SOP: branch isolation)
    if (socket.branchRoom) {
      socket.join(socket.branchRoom);
    }

    // Super Admin joins all-branches room
    if (socket.user.role === ROLES.SUPER_ADMIN) {
      socket.join('admin:all');
    }

    // Join user-specific room for targeted notifications
    socket.join(`user:${socket.user.id}`);

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      logger.info(`Socket disconnected: ${socket.user.name}`, {
        socketId: socket.id,
        reason,
      });
    });

    // Error handling
    socket.on('error', (error) => {
      logger.error('Socket error', {
        socketId: socket.id,
        user: socket.user.name,
        error: error.message,
      });
    });
  });

  // ── Register Namespace Handlers ──
  // Each namespace maps to an SOP synchronization target (SOP §20.1)
  const setupNamespace = require('../sockets');
  setupNamespace(io);

  logger.info('Socket.IO initialized with authentication');

  return io;
}

module.exports = { initializeSocket };
