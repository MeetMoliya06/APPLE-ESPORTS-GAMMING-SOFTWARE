// SOP §9: Billing Counter Dashboard — PRIMARY OPERATIONAL DASHBOARD
const express = require('express');
const router = express.Router();
const { requireDashboardAccess } = require('../middleware/roles');
const { DASHBOARDS } = require('../utils/constants');

router.use(requireDashboardAccess(DASHBOARDS.BILLING_COUNTER));

router.get('/', (req, res) => {
  res.json({ success: true, message: 'Billing endpoint ready', data: [] });
});

router.post('/create', (req, res) => {
  res.status(501).json({ success: false, message: 'Bill creation — not yet implemented' });
});

router.post('/:id/payment', (req, res) => {
  res.status(501).json({ success: false, message: 'Payment processing — not yet implemented' });
});

router.post('/:id/split-payment', (req, res) => {
  res.status(501).json({ success: false, message: 'Split payment — not yet implemented' });
});

module.exports = router;
