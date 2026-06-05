// ═══════════════════════════════════════════════════════════
// Gaming Café ERP — Environment Configuration
// Fail-fast validation for all required environment variables
// ═══════════════════════════════════════════════════════════

const requiredVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
];

function validateEnvironment() {
  const missing = requiredVars.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    console.error('══════════════════════════════════════════');
    console.error('FATAL: Missing required environment variables:');
    missing.forEach((key) => console.error(`  → ${key}`));
    console.error('══════════════════════════════════════════');
    process.exit(1);
  }
}

const config = {
  // Server
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 4000,
  isDev: (process.env.NODE_ENV || 'development') === 'development',
  isProd: process.env.NODE_ENV === 'production',

  // Database
  databaseUrl: process.env.DATABASE_URL,
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    name: process.env.DB_NAME || 'gamecafe_erp',
    user: process.env.DB_USER || 'gamecafe_admin',
    password: process.env.DB_PASSWORD || '',
    poolMin: parseInt(process.env.DB_POOL_MIN, 10) || 2,
    poolMax: parseInt(process.env.DB_POOL_MAX, 10) || 20,
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
  },

  // CORS
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  socketCorsOrigin: process.env.SOCKET_CORS_ORIGIN || 'http://localhost:5173',

  // SOP Operational Config
  sessionTimeoutMs: parseInt(process.env.SESSION_TIMEOUT_MS, 10) || 86400000,
  reservationGracePeriodMin: parseInt(process.env.RESERVATION_GRACE_PERIOD_MIN, 10) || 15,
  longSessionAlertHours: parseInt(process.env.LONG_SESSION_ALERT_HOURS, 10) || 8,

  // Logging
  logLevel: process.env.LOG_LEVEL || 'debug',
  logDir: process.env.LOG_DIR || './logs',
};

module.exports = { validateEnvironment, config };
