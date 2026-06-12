// SOP §10: Cash Register Dashboard — Physical Cash Drawer Control
const express = require('express');
const router = express.Router();
const { requireDashboardAccess } = require('../middleware/roles');
const { DASHBOARDS } = require('../utils/constants');

router.use(requireDashboardAccess(DASHBOARDS.CASH_REGISTER));

router.get('/', (req, res) => {
  res.json({ success: true, message: 'Cash register endpoint ready', data: [] });
});

router.post('/open', (req, res) => {
  res.status(501).json({ success: false, message: 'Opening balance — not yet implemented' });
});

router.post('/verify', (req, res) => {
  res.status(501).json({ success: false, message: 'Shift verification — not yet implemented' });
});

module.exports = router;
