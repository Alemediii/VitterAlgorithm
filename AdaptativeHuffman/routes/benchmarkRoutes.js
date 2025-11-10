const express = require('express');
const controller = require('../controllers/benchmarkController');
const router = express.Router();

router.get('/api/benchmark/times', (req, res) => controller.getTimes(req, res));

module.exports = router;

