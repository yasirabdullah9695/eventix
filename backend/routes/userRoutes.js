const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, authorize('admin'), userController.getAllUsers);

module.exports = router;
