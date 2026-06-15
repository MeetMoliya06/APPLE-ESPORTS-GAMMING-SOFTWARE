// ═══════════════════════════════════════════════════════════
// Gaming Café ERP — Server Entry Point
// Enterprise Gaming Café Management System
// SOP: Centralized Multi-Branch Real-Time Operations Platform
// ═══════════════════════════════════════════════════════════

require('dotenv').config();

const http = require('http');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// Config
const { validateEnvironment, config } = require('./config/environment');
const { healthCheck, closePool } = require('./config/database');
const { initializeSocket } = require('./config/socket');

// Middleware
const { notFoundHandler, globalErrorHandler } = require('./middleware/errorHandler');

// Routes
const routes = require('./routes');

// Utils
const logger = require('./utils/logger');

// ── Validate Environment ──
validateEnvironment();

// ── Create Express App ──
const app = express();
const server = http.createServer(app);

// ── Initialize Socket.IO ──
const io = initializeSocket(server);

// Make io accessible to routes/controllers for emitting events
app.set('io', io);

// ═══════════════════════════════════════════════
// MIDDLEWARE CHAIN (order matters!)
// SOP §21: Security Model
// ═══════════════════════════════════════════════

// Security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// CORS
app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Branch-Id'],
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use(morgan('short', {
  stream: {
    write: (message) => logger.info(message.trim()),
  },
  skip: (req) => req.path === '/api/health',
}));

// ── API Routes ──
app.use('/api', routes);

// ── 404 Handler ──
app.use(notFoundHandler);

// ── Global Error Handler (must be last) ──
app.use(globalErrorHandler);

// ═══════════════════════════════════════════════
// START SERVER
// ═══════════════════════════════════════════════
const PORT = config.port;

async function startServer() {
  try {
    // Verify database connectivity
    const dbHealth = await healthCheck();
    if (dbHealth.status === 'healthy') {
      logger.info('Database connected successfully', {
        timestamp: dbHealth.timestamp,
        connections: dbHealth.totalConnections,
      });
    } else {
      logger.warn('Database not ready — server will start but DB operations may fail', {
        error: dbHealth.error,
      });
    }

    // Start HTTP + Socket.IO server
    server.listen(PORT, () => {
      logger.info('═══════════════════════════════════════════════');
      logger.info('  AppleEsports Pro — Gaming Café ERP Server');
      logger.info('═══════════════════════════════════════════════');
      logger.info(`  Environment : ${config.nodeEnv}`);
      logger.info(`  HTTP Server : http://localhost:${PORT}`);
      logger.info(`  API Base    : http://localhost:${PORT}/api`);
      logger.info(`  Health      : http://localhost:${PORT}/api/health`);
      logger.info(`  Socket.IO   : ws://localhost:${PORT}`);
      logger.info(`  CORS Origin : ${config.corsOrigin}`);
      logger.info('═══════════════════════════════════════════════');
      logger.info('  SOP Compliance: MASTER SOP v1.0');
      logger.info('  Middleware Chain: helmet → cors → auth → RBAC → branch → audit');
      logger.info('  Socket Namespaces: sessions, billing, reservations, pc-status, food-orders, cash, notifications');
      logger.info('═══════════════════════════════════════════════');
    });
  } catch (error) {
    logger.error('Failed to start server', { error: error.message });
    process.exit(1);
  }
}

// ═══════════════════════════════════════════════
// GRACEFUL SHUTDOWN
// ═══════════════════════════════════════════════
function gracefulShutdown(signal) {
  logger.info(`${signal} received. Starting graceful shutdown...`);

  server.close(async () => {
    logger.info('HTTP server closed');

    // Close Socket.IO
    io.close(() => {
      logger.info('Socket.IO server closed');
    });

    // Close database pool
    await closePool();

    logger.info('Graceful shutdown complete');
    process.exit(0);
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection', { reason: reason?.message || reason });
  process.exit(1);
});

// ── Start ──
startServer();

module.exports = { app, server, io };
