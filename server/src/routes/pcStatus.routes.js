// SOP §17: PC Status Dashboard (Super Admin only)
const express = require('express');
const router = express.Router();
const { superAdminOnly } = require('../middleware/roles');

router.use(superAdminOnly);

router.get('/', (req, res) => {
  res.json({ success: true, message: 'PC Status endpoint ready', data: [] });
});

router.get('/all', (req, res) => {
  res.status(501).json({ success: false, message: 'All PC states — not yet implemented' });
});

router.put('/:id/state', (req, res) => {
  res.status(501).json({ success: false, message: 'PC state update — not yet implemented' });
});

module.exports = router;
