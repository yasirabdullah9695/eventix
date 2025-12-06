
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

console.log('authController object:', authController);
console.log('Type of authController.loginUser (after import):', typeof authController.loginUser);

const { protect } = require('../middleware/authMiddleware');
const uploadMiddleware = require('../middleware/uploadMiddleware');

router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);
router.post('/admin-login', authController.adminLogin);
router.put('/profile', protect, uploadMiddleware, authController.updateUserProfile);
router.get('/me', protect, authController.getMe);


module.exports = router;
