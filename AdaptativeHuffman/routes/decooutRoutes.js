const express = require('express');
const path = require('path');
const router = express.Router();

// Serve the decoout UI
router.get('/', (req, res) => {
  const file = path.join(__dirname, '..', 'views', 'decoout.html');
  return res.sendFile(file);
});

module.exports = router;

