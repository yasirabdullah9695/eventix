const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const registrationController = require('../controllers/registrationController'); // Import registration controller

const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware'); // Import upload middleware

router.route('/')
    .post(protect, authorize('admin'), upload, eventController.createEvent) // Apply upload middleware
    .get(eventController.getEvents);

router.route('/:id')
    .get(eventController.getEventById)
    .put(protect, authorize('admin'), upload, eventController.updateEvent) // Apply upload middleware
    .delete(protect, authorize('admin'), eventController.deleteEvent);

// Route to get registrations for a specific event
router.route('/:id/registrations').get(protect, authorize('admin'), registrationController.getRegistrationsForEvent);

module.exports = router;