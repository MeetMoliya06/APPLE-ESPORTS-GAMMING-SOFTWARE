// ═══════════════════════════════════════════════════════════
// Gaming Café ERP — PostgreSQL Database Configuration
// SOP §23: Central Database + Connection Pooling
// ═══════════════════════════════════════════════════════════

const { Pool } = require('pg');
const { config } = require('./environment');
const logger = require('../utils/logger');

const pool = new Pool({
  connectionString: config.databaseUrl,
  min: config.db.poolMin,
  max: config.db.poolMax,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Connection event logging
pool.on('connect', () => {
  logger.debug('New database connection established');
});

pool.on('error', (err) => {
  logger.error('Unexpected database pool error', { error: err.message });
});

/**
 * Execute a single query
 */
async function query(text, params) {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    logger.debug('Query executed', {
      query: text.substring(0, 100),
      duration: `${duration}ms`,
      rows: result.rowCount,
    });
    return result;
  } catch (error) {
    logger.error('Query failed', {
      query: text.substring(0, 100),
      error: error.message,
    });
    throw error;
  }
}

/**
 * Execute multiple queries inside a transaction
 * SOP: Ensures atomic operations for billing, payments, session state changes
 */
async function transaction(callback) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Transaction rolled back', { error: error.message });
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Health check for database connectivity
 */
async function healthCheck() {
  try {
    const result = await pool.query('SELECT NOW() as current_time');
    return {
      status: 'healthy',
      timestamp: result.rows[0].current_time,
      totalConnections: pool.totalCount,
      idleConnections: pool.idleCount,
      waitingConnections: pool.waitingCount,
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
    };
  }
}

/**
 * Graceful shutdown
 */
async function closePool() {
  logger.info('Closing database connection pool...');
  await pool.end();
  logger.info('Database pool closed');
}

module.exports = {
  pool,
  query,
  transaction,
  healthCheck,
  closePool,
};
