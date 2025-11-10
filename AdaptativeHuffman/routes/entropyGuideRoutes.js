const express = require('express');
const path = require('path');
const router = express.Router();

router.get('/guide', (req, res) => {
  const file = path.join(__dirname, '..', 'views', 'entropy-guide.html');
  return res.sendFile(file);
});

module.exports = router;

