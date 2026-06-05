// SOP §7: Session Engine
const express = require('express');
const router = express.Router();
const { authorize, requireDashboardAccess } = require('../middleware/roles');
const { ROLES, DASHBOARDS } = require('../utils/constants');

router.use(requireDashboardAccess(DASHBOARDS.SESSIONS));

router.get('/', (req, res) => {
  res.json({ success: true, message: 'Sessions endpoint ready', data: [] });
});

router.post('/start', (req, res) => {
  res.status(501).json({ success: false, message: 'Session start — not yet implemented' });
});

router.post('/:id/stop', (req, res) => {
  res.status(501).json({ success: false, message: 'Session stop — not yet implemented' });
});

router.post('/:id/extend', (req, res) => {
  res.status(501).json({ success: false, message: 'Session extend — not yet implemented' });
});

router.post('/:id/transfer', (req, res) => {
  res.status(501).json({ success: false, message: 'Session transfer — not yet implemented' });
});

module.exports = router;
