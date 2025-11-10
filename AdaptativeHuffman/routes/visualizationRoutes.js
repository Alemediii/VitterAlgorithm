const express = require('express');
const path = require('path');
const router = express.Router();
const controller = require('../controllers/visualizationController');

// Serve UI template: GET / (mounted under /api/visualization or can be mounted directly)
router.get('/', (req, res) => {
  const tpl = path.join(__dirname, '..', 'views', 'templates', 'tree-visualiization.html');
  return res.sendFile(tpl);
});

// GET /api/visualization/tree?source=...
router.get('/tree', controller.getTree);

// POST /api/visualization/encode-roundtrip  { source }
router.post('/encode-roundtrip', controller.encodeRoundtrip);

module.exports = router;
