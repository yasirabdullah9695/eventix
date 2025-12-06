const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/generate', protect, authorize('admin'), reportController.generateReport);

module.exports = router;