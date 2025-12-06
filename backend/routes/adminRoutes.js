const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const adminController = require('../controllers/adminController');
const { createUser, declareWinner, verifyTicket, verifyPayment } = require('../controllers/adminController');

router.post('/users', protect, authorize('admin'), createUser);
router.put('/nominations/:id/declare-winner', protect, authorize('admin'), declareWinner);
router.post('/verify-ticket', protect, authorize('admin'), verifyTicket);
router.put('/registrations/:id/verify-payment', protect, authorize('admin'), verifyPayment);


module.exports = router;

