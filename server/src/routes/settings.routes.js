// SOP §19: Settings Dashboard — SUPER ADMIN CONTROL CENTER
const express = require('express');
const router = express.Router();
const { superAdminOnly } = require('../middleware/roles');

router.use(superAdminOnly);

router.get('/', (req, res) => {
  res.json({ success: true, message: 'Settings endpoint ready', data: [] });
});

router.get('/audit-logs', (req, res) => {
  res.status(501).json({ success: false, message: 'Audit logs — not yet implemented' });
});

router.put('/config/:key', (req, res) => {
  res.status(501).json({ success: false, message: 'Config update — not yet implemented' });
});

module.exports = router;
