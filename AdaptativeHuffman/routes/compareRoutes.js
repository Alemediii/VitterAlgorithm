const express = require('express');
const multer = require('multer');
const upload = multer();
const controller = require('../controllers/compareController');

const router = express.Router();

// Serve compare page at /compare
router.get('/compare', (req, res) => {
  const path = require('path');
  return res.sendFile(path.join(__dirname, '..', 'views', 'compare.html'));
});

// POST /api/compare - compare on provided source or uploaded file
router.post('/api/compare', upload.single('file'), (req, res) => controller.compare(req, res));

module.exports = router;
