// SOP §13: Menu Editor Dashboard — Food Inventory Management
const express = require('express');
const router = express.Router();
const { requireDashboardAccess } = require('../middleware/roles');
const { DASHBOARDS } = require('../utils/constants');

router.use(requireDashboardAccess(DASHBOARDS.MENU_EDITOR));

router.get('/', (req, res) => {
  res.json({ success: true, message: 'Menu editor endpoint ready', data: [] });
});

router.post('/', (req, res) => {
  res.status(501).json({ success: false, message: 'Menu item create — not yet implemented' });
});

router.put('/:id', (req, res) => {
  res.status(501).json({ success: false, message: 'Menu item update — not yet implemented' });
});

router.post('/:id/refill', (req, res) => {
  res.status(501).json({ success: false, message: 'Stock refill — not yet implemented' });
});

module.exports = router;
