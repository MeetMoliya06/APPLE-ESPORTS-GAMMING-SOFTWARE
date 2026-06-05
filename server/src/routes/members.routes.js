// SOP §14: Members Dashboard — Wallet, Loyalty, History
const express = require('express');
const router = express.Router();
const { requireDashboardAccess } = require('../middleware/roles');
const { DASHBOARDS } = require('../utils/constants');

router.use(requireDashboardAccess(DASHBOARDS.MEMBERS));

router.get('/', (req, res) => {
  res.json({ success: true, message: 'Members endpoint ready', data: [] });
});

router.post('/', (req, res) => {
  res.status(501).json({ success: false, message: 'Member create — not yet implemented' });
});

router.post('/:id/wallet/recharge', (req, res) => {
  res.status(501).json({ success: false, message: 'Wallet recharge — not yet implemented' });
});

router.get('/:id/history', (req, res) => {
  res.status(501).json({ success: false, message: 'Member history — not yet implemented' });
});

module.exports = router;
