
const { io } = require('../index');
const Registration = require('../models/registrationModel');
const User = require('../models/userModel');
const Event = require('../models/eventModel');
const { v4: uuidv4 } = require('uuid');

// @desc    Get all registrations
// @route   GET /api/registrations
// @access  Private/Admin
const getRegistrations = async (req, res) => {
    try {
        let filter = {};
        if (req.user.role === 'house_admin') {
            // This filter needs to be adjusted to work with the populated user data
            // We'll fetch all and then filter in the application logic, or adjust the query.
            // For now, let's get the house admin's house name and filter later.
        }

        const registrations = await Registration.find(filter)
            .populate('event_id')
            .populate({
                path: 'user_id',
                populate: {
                    path: 'house_id',
                    select: 'name' // Only fetch the name of the house
                }
            })
            .lean(); // Use .lean() for better performance as we are not modifying the docs

        // Reshape the data to match what the frontend expects
        const formattedRegistrations = registrations.map(reg => {
            const user = reg.user_id;
            if (user && user.house_id) {
                // Flatten the house name into the user object for easier access
                user.house = user.house_id.name;
            }
            // The frontend also expects `r.user_id.house`. Let's ensure it's there.
            // No, the original code used r.user_id.house. The logic above handles this.

            // If the role is house_admin, filter registrations by their house
            if (req.user.role === 'house_admin' && (!user || !user.house_id || user.house_id._id.toString() !== req.user.house_id.toString())) {
                return null; // This registration will be filtered out
            }
            
            return reg;
        }).filter(Boolean); // Remove null entries

        // console.log('Formatted Registrations (first 2):', formattedRegistrations.slice(0, 2).map(reg => ({ 
        //     _id: reg._id, 
        //     event_id: reg.event_id ? { _id: reg.event_id._id, name: reg.event_id.name } : null,
        //     user_id: reg.user_id ? { 
        //         _id: reg.user_id._id, 
        //         full_name: reg.user_id.full_name, 
        //         email: reg.user_id.email, 
        //         house: reg.user_id.house // The important part
        //     } : null,
        // })));

        res.json(formattedRegistrations);
    } catch (error) {
        console.error('Error in getRegistrations:', error);
        res.status(500).json({ message: 'Server Error', error: error.message, stack: error.stack });
    }
};

// @desc    Create a registration
// @route   POST /api/registrations
// @access  Private
const createRegistration = async (req, res) => {
    try {
        console.log('Received registration creation request:');
        console.log('req.body:', req.body);
        console.log('req.file:', req.file);
        console.log('req.files:', req.files);

        const { event_id, student_name, student_email, phone, branch, year, transaction_id, paymentAmount } = req.body;
        const user_id = req.user.id;
        let payment_screenshot_url = '';

        console.log('Extracted from req.body - student_name:', student_name, 'student_email:', student_email, 'phone:', phone, 'branch:', branch, 'year:', year);

        // Prevent admins from registering for events
        if (req.user.role === 'admin') {
            return res.status(403).json({ message: 'Admins cannot register for events.' });
        }

        const event = await Event.findById(event_id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        const user = await User.findById(user_id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        console.log('Fetched User object:', user.toObject());

        // Check if the user is already registered for the event
        const existingRegistration = await Registration.findOne({ event_id, user_id });
        if (existingRegistration) {
            return res.status(400).json({ message: 'You are already registered for this event' });
        }

        // Handle payment screenshot upload
        if (req.files && req.files.payment_screenshot && req.files.payment_screenshot[0]) {
            payment_screenshot_url = `${req.protocol}://${req.get('host')}/uploads/${req.files.payment_screenshot[0].filename}`;
        }
        console.log('Payment screenshot URL:', payment_screenshot_url);

        let payment_verified = false; // Default to false, admin will verify
        if (event.registration_fee > 0) {
            if (!transaction_id || !payment_screenshot_url) {
                return res.status(400).json({ message: 'Transaction ID and payment screenshot are required for paid events.' });
            }

            // Check for unique transaction_id for this event
            const existingTransaction = await Registration.findOne({ event_id, transaction_id });
            if (existingTransaction) {
                return res.status(400).json({ message: 'This transaction ID has already been used for this event.' });
            }

            // Check for unique payment_screenshot_url for this event
            const existingScreenshot = await Registration.findOne({ event_id, payment_screenshot_url });
            if (existingScreenshot) {
                return res.status(400).json({ message: 'This payment screenshot has already been used for this event.' });
            }

            // Payment is not automatically verified here, admin will do it manually
            payment_verified = false;
        } else {
            payment_verified = true; // Free events are automatically verified
        }

        const registration = new Registration({
            event_id,
            user_id,
            student_name: student_name || user.full_name,
            student_email: student_email || user.email,
            phone: phone || user.phone,
            branch: branch || user.branch,
            house_id: user.house, // House information is still required
            ticket_id: uuidv4(),
            transaction_id: transaction_id || undefined,
            payment_screenshot_url,
            payment_verified,
        });
        console.log('Registration object before saving:', registration.toObject());

        let createdRegistration = await registration.save();
        createdRegistration = await createdRegistration.populate('event_id');
        createdRegistration = await createdRegistration.populate({ path: 'user_id', select: 'full_name' });


        res.status(201).json(createdRegistration);
    } catch (error) {
        console.error('Error in createRegistration:', error);
        res.status(500).json({ message: 'Server Error', error: error.message, stack: error.stack });
    }
};

// @desc    Get registrations for an event
// @route   GET /api/events/:id/registrations
// @access  Private/Admin
const getRegistrationsForEvent = async (req, res) => {
    try {
        const registrations = await Registration.find({ event_id: req.params.id }).populate('user_id', 'full_name email');
        res.json(registrations);
    } catch (error) {
        console.error('Error in getRegistrationsForEvent:', error);
        res.status(500).json({ message: 'Server Error', error: error.message, stack: error.stack });
    }
};

// @desc    Get registration by ID
// @route   GET /api/registrations/:id
// @access  Private
const getRegistrationById = async (req, res) => {
    try {
        const registration = await Registration.findById(req.params.id).populate('event_id').populate('user_id');
        if (!registration) {
            return res.status(404).json({ message: 'Registration not found' });
        }
        res.json(registration);
    } catch (error) {
        console.error('Error in getRegistrationById:', error);
        res.status(500).json({ message: 'Server Error', error: error.message, stack: error.stack });
    }
};


// @desc    Get logged in user registrations
// @route   GET /api/registrations/myregistrations
// @access  Private
const getMyRegistrations = async (req, res) => {
    try {
        const { eventId } = req.query;
        let filter = { user_id: req.user.id }; // Filter by user_id from protected route

        if (eventId) {
            filter.event_id = eventId;
        }

        const registrations = await Registration.find(filter)
            .populate('event_id')
            .populate('user_id', 'full_name');

        const formattedRegistrations = registrations.map(reg => ({
            ...reg.toObject(),
            event: reg.event_id,
            user: reg.user_id,
        }));

        res.json(formattedRegistrations);
    } catch (error) {
        console.error('Error in getMyRegistrations:', error);
        res.status(500).json({ message: 'Server Error', error: error.message, stack: error.stack });
    }
};

// @desc    Delete a registration
// @route   DELETE /api/registrations/:id
// @access  Private/Admin
const deleteRegistration = async (req, res) => {
    try {
        const registration = await Registration.findById(req.params.id).populate('user_id');

        if (!registration) {
            return res.status(404).json({ message: 'Registration not found' });
        }

        if (req.user.role === 'student') {
            return res.status(403).json({ message: 'Not authorized to perform this action' });
        }

        if (req.user.role === 'house_admin') {
            if (!registration.user_id.house_id || registration.user_id.house_id.toString() !== req.user.house_id.toString()) {
                return res.status(403).json({ message: 'You are not authorized to delete this registration' });
            }
        }

        await Registration.findByIdAndDelete(req.params.id);
        res.json({ message: 'Registration removed' });
    } catch (error) {
        console.error('Error in deleteRegistration:', error);
        res.status(500).json({ message: 'Server Error', error: error.message, stack: error.stack });
    }
};

// @desc    Get registration by ticket ID
// @route   GET /api/registrations/ticket/:ticketId
// @access  Private
const getRegistrationByTicketId = async (req, res) => {
    try {
        const registration = await Registration.findOne({ ticket_id: req.params.ticketId })
            .populate('event_id')
            .populate('user_id');

        if (!registration) {
            return res.status(404).json({ message: 'Registration not found for this ticket ID' });
        }

        // Optional: Add a check to ensure only the registered user or an admin can view this ticket
        // if (req.user.role !== 'admin' && registration.user_id._id.toString() !== req.user.id) {
        //     return res.status(403).json({ message: 'Not authorized to view this registration' });
        // }

        res.json(registration);
    } catch (error) {
        console.error('Error in getRegistrationByTicketId:', error);
        res.status(500).json({ message: 'Server Error', error: error.message, stack: error.stack });
    }
};

// @desc    Update registration payment status
// @route   PUT /api/registrations/:id/verify-payment
// @access  Private/Admin
const updateRegistrationPaymentStatus = async (req, res) => {
    try {
        const registration = await Registration.findById(req.params.id).populate('user_id');

        if (!registration) {
            return res.status(404).json({ message: 'Registration not found' });
        }

        // Only allow admin to verify payment
        if (req.user.role === 'student') {
            return res.status(403).json({ message: 'Not authorized to perform this action' });
        }

        if (req.user.role === 'house_admin') {
            if (!registration.user_id.house_id || registration.user_id.house_id.toString() !== req.user.house_id.toString()) {
                return res.status(403).json({ message: 'You are not authorized to verify payment for this user' });
            }
        }

        registration.payment_verified = true;
        const updatedRegistration = await registration.save();

        io.emit('updateRegistration', updatedRegistration); // Notify clients of update

        res.json(updatedRegistration);
    } catch (error) {
        console.error('Error in updateRegistrationPaymentStatus:', error);
        res.status(500).json({ message: 'Server Error', error: error.message, stack: error.stack });
    }
};

// @desc    Mark attendance for a registration
// @route   PUT /api/registrations/scan/:ticketId/attend
// @access  Private/Admin
const markAttendance = async (req, res) => {
    try {
        const registration = await Registration.findById(req.params.id).populate('user_id');

        if (!registration) {
            return res.status(404).json({ message: 'Registration not found' });
        }

        if (req.user.role === 'house_admin') {
            if (!registration.user_id.house_id || registration.user_id.house_id.toString() !== req.user.house_id.toString()) {
                return res.status(403).json({ message: 'You are not authorized to mark attendance for this user' });
            }
        }

        if (registration.attendance_marked) {
            return res.status(400).json({ message: 'Attendance already marked for this ticket' });
        }

        registration.attendance_marked = true;
        await registration.save();

        res.json({ message: 'Attendance marked successfully' });
    } catch (error) {
        console.error('Error in markAttendance:', error);
        res.status(500).json({ message: 'Server Error', error: error.message, stack: error.stack });
    }
};

module.exports = {
    getRegistrations,
    createRegistration,
    getRegistrationsForEvent,
    getRegistrationById,
    getMyRegistrations,
    deleteRegistration,
    getRegistrationByTicketId,
    updateRegistrationPaymentStatus,
    markAttendance
};
