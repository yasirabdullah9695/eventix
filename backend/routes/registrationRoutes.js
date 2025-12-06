
const express = require('express');
const router = express.Router();
const {
    getRegistrations,
    createRegistration,
    getRegistrationsForEvent,
    getRegistrationById,
    getMyRegistrations,
    deleteRegistration,
    getRegistrationByTicketId,
    updateRegistrationPaymentStatus
} = require('../controllers/registrationController');
const { protect, authorize } = require('../middleware/authMiddleware');
const uploadMiddleware = require('../middleware/uploadMiddleware');

// Routes for /api/registrations
router.route('/')
    .get(protect, authorize('admin'), getRegistrations)
    .post(protect, uploadMiddleware, createRegistration);

router.route('/myregistrations')
    .get(protect, getMyRegistrations);

// Public route for QR code scanning
router.route('/scan/:ticketId')
    .get(getRegistrationByTicketId);

// New route for fetching registration by ticket ID
router.route('/ticket/:ticketId')
    .get(protect, getRegistrationByTicketId); // Added this

router.route('/:id')
    .get(protect, getRegistrationById)
    .delete(protect, authorize('admin'), deleteRegistration);

// New route for verifying payment
router.route('/:id/verify-payment')
    .put(protect, authorize('admin'), updateRegistrationPaymentStatus); // Added this

// New route for marking attendance
router.route('/:id/attend')
    .put(protect, authorize('admin'), (req, res) => {
        const { markAttendance } = require('../controllers/registrationController');
        markAttendance(req, res);
    });

// Route for getting registrations for a specific event
router.route('/event/:id')
    .get(protect, authorize('admin'), getRegistrationsForEvent);

module.exports = router;
