const express = require('express');
const multer = require('multer');
const upload = multer();
const controller = require('../controllers/analysisController');

const router = express.Router();

// POST /entropy - analyze posted data or uploaded file
router.post('/entropy', upload.single('file'), (req, res) => controller.analyzeEntropy(req, res));

// POST /generate-source - generate a source (uniform/skewed)
router.post('/generate-source', (req, res) => controller.generateSource(req, res));

module.exports = router;
