// SOP §12: Food Orders Dashboard
const express = require('express');
const router = express.Router();
const { requireDashboardAccess } = require('../middleware/roles');
const { DASHBOARDS } = require('../utils/constants');

router.use(requireDashboardAccess(DASHBOARDS.FOOD_ORDERS));

router.get('/', (req, res) => {
  res.json({ success: true, message: 'Food orders endpoint ready', data: [] });
});

router.post('/', (req, res) => {
  res.status(501).json({ success: false, message: 'Food order create — not yet implemented' });
});

router.put('/:id/status', (req, res) => {
  res.status(501).json({ success: false, message: 'Order status update — not yet implemented' });
});

module.exports = router;
