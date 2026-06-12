// SOP §18: End of Day Dashboard
const express = require('express');
const router = express.Router();
const { requireDashboardAccess } = require('../middleware/roles');
const { DASHBOARDS } = require('../utils/constants');

router.use(requireDashboardAccess(DASHBOARDS.EOD));

router.get('/', (req, res) => {
  res.json({ success: true, message: 'EOD endpoint ready', data: [] });
});

router.get('/report', (req, res) => {
  res.status(501).json({ success: false, message: 'EOD report — not yet implemented' });
});

router.post('/finalize', (req, res) => {
  res.status(501).json({ success: false, message: 'EOD finalize — not yet implemented' });
});

module.exports = router;
