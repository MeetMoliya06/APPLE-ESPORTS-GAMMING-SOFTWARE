// SOP §11: Cash Desk Dashboard — Payment Flow Monitoring
const express = require('express');
const router = express.Router();
const { requireDashboardAccess } = require('../middleware/roles');
const { DASHBOARDS } = require('../utils/constants');

router.use(requireDashboardAccess(DASHBOARDS.CASH_DESK));

router.get('/', (req, res) => {
  res.json({ success: true, message: 'Cash desk endpoint ready', data: [] });
});

router.post('/denomination-count', (req, res) => {
  res.status(501).json({ success: false, message: 'Denomination count — not yet implemented' });
});

module.exports = router;
