const express = require('express');
const multer = require('multer');
const upload = multer();
const controller = require('../controllers/compressionController');

const router = express.Router();

// POST /compress - accepts multipart/form-data file or JSON body { data: '...' }
router.post('/compress', upload.single('file'), (req, res) => controller.compress(req, res));

// POST /decompress - accepts multipart file or JSON body { compressedBase64: '...' }
router.post('/decompress', upload.single('file'), (req, res) => controller.decompress(req, res));

// New endpoints: file-based upload that returns attachment
router.post('/compress/upload', upload.single('file'), (req, res) => controller.compressFile(req, res));
router.post('/decompress/upload', upload.single('file'), (req, res) => controller.decompressFile(req, res));

module.exports = router;
