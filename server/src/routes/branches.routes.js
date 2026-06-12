// SOP §16: Branch Management (Super Admin only)
const express = require('express');
const router = express.Router();
const { superAdminOnly } = require('../middleware/roles');

router.use(superAdminOnly);

router.get('/', (req, res) => {
  res.json({ success: true, message: 'Branches endpoint ready', data: [] });
});

router.post('/', (req, res) => {
  res.status(501).json({ success: false, message: 'Branch creation — not yet implemented' });
});

router.put('/:id', (req, res) => {
  res.status(501).json({ success: false, message: 'Branch update — not yet implemented' });
});

module.exports = router;
