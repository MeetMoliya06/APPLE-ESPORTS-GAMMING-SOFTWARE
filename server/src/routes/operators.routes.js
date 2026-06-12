// SOP §19: Operator Management (Super Admin only)
const express = require('express');
const router = express.Router();
const { superAdminOnly } = require('../middleware/roles');

router.use(superAdminOnly);

router.get('/', (req, res) => {
  res.json({ success: true, message: 'Operators endpoint ready', data: [] });
});

router.post('/', (req, res) => {
  res.status(501).json({ success: false, message: 'Operator creation — not yet implemented' });
});

router.put('/:id/permissions', (req, res) => {
  res.status(501).json({ success: false, message: 'Permission update — not yet implemented' });
});

router.put('/:id/suspend', (req, res) => {
  res.status(501).json({ success: false, message: 'Operator suspend — not yet implemented' });
});

module.exports = router;
