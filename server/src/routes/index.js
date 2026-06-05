// ═══════════════════════════════════════════════════════════
// Gaming Café ERP — Central Route Registrar
// SOP §24: Frontend → REST APIs → Business Logic → Database
// ═══════════════════════════════════════════════════════════

const express = require('express');
const router = express.Router();

const { authenticate } = require('../middleware/auth');
const { enforceBranchIsolation } = require('../middleware/branchIsolation');
const { auditMiddleware } = require('../middleware/audit');
const { apiLimiter } = require('../middleware/rateLimiter');

// ── Public routes (no auth) ──
const authRoutes = require('./auth.routes');

// ── Protected route shells (to be built per dashboard) ──
const branchesRoutes = require('./branches.routes');
const operatorsRoutes = require('./operators.routes');
const sessionsRoutes = require('./sessions.routes');
const reservationsRoutes = require('./reservations.routes');
const billingRoutes = require('./billing.routes');
const cashRegisterRoutes = require('./cashRegister.routes');
const cashDeskRoutes = require('./cashDesk.routes');
const foodOrdersRoutes = require('./foodOrders.routes');
const menuEditorRoutes = require('./menuEditor.routes');
const membersRoutes = require('./members.routes');
const eodRoutes = require('./eod.routes');
const pcStatusRoutes = require('./pcStatus.routes');
const settingsRoutes = require('./settings.routes');

// ── Health Check ──
router.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    service: 'GameCafe ERP API',
  });
});

// ── Auth Routes (public + protected mixed) ──
router.use('/auth', authRoutes);

// ══════════════════════════════════════════════
// ALL ROUTES BELOW REQUIRE:
// 1. Authentication (JWT)
// 2. Branch Isolation
// 3. Audit Middleware
// 4. Rate Limiting
// ══════════════════════════════════════════════
router.use(authenticate);
router.use(enforceBranchIsolation);
router.use(auditMiddleware);
router.use(apiLimiter);

// ── Protected Routes (SOP Dashboard Mapping) ──
router.use('/branches', branchesRoutes);        // SOP §16: Branch Management
router.use('/operators', operatorsRoutes);      // SOP §19: Operator Management
router.use('/sessions', sessionsRoutes);        // SOP §7: Session Engine
router.use('/reservations', reservationsRoutes);// SOP §8: Reservation System
router.use('/billing', billingRoutes);          // SOP §9: Billing Counter
router.use('/cash-register', cashRegisterRoutes);// SOP §10: Cash Register
router.use('/cash-desk', cashDeskRoutes);       // SOP §11: Cash Desk
router.use('/food-orders', foodOrdersRoutes);   // SOP §12: Food Orders
router.use('/menu-editor', menuEditorRoutes);   // SOP §13: Menu Editor
router.use('/members', membersRoutes);          // SOP §14: Members
router.use('/eod', eodRoutes);                  // SOP §18: End of Day
router.use('/pc-status', pcStatusRoutes);       // SOP §17: PC Status
router.use('/settings', settingsRoutes);        // SOP §19: Settings

module.exports = router;
