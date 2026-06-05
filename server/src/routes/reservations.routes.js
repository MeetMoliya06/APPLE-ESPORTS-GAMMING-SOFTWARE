// SOP §8: Reservation System
const express = require('express');
const router = express.Router();
const { requireDashboardAccess } = require('../middleware/roles');
const { DASHBOARDS } = require('../utils/constants');

router.use(requireDashboardAccess(DASHBOARDS.RESERVATIONS));

router.get('/', (req, res) => {
  res.json({ success: true, message: 'Reservations endpoint ready', data: [] });
});

router.post('/', (req, res) => {
  res.status(501).json({ success: false, message: 'Reservation create — not yet implemented' });
});

router.post('/:id/cancel', (req, res) => {
  res.status(501).json({ success: false, message: 'Reservation cancel — not yet implemented' });
});

router.post('/:id/start', (req, res) => {
  res.status(501).json({ success: false, message: 'Start reserved session — not yet implemented' });
});

module.exports = router;
