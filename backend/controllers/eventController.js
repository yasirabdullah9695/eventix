
const Event = require('../models/eventModel');
const User = require('../models/userModel');
const Notification = require('../models/notificationModel');
const { createAndSendNotification } = require('../utils/notificationUtils');

// @desc    Get all events
// @route   GET /api/events
// @access  Public
const getEvents = async (req, res) => {
    console.log('getEvents function called');
    try {
        console.log('Fetching events from database...');
        let filter = {};

        // Check if the user is an admin
        if (req.user && req.user.role !== 'admin') {
            // If not admin, filter out completed events
            filter.status = { $ne: 'completed' };
        }

        const events = await Event.find(filter).sort({ date: -1 });
        console.log('Events fetched successfully:', events);
        res.json(events);
    } catch (error) {
        console.error('Error in getEvents:', error);
        res.status(500).json({ message: 'Server Error', error: error.message, stack: error.stack });
    }
};

// @desc    Create an event
// @route   POST /api/events
// @access  Private/Admin
const createEvent = async (req, res) => {
    const io = req.app.get('socketio');
    try {
        console.log('Received event creation request:');
        console.log('req.body:', req.body);
        console.log('req.files:', req.files);
        
        let { 
            name, 
            date, 
            time, 
            location, 
            description, 
            category, 
            registration_fee = 0, 
            max_participants, 
            payment_qr_url, 
            house_points = 0, 
            status = 'upcoming' 
        } = req.body;

        const requiredFields = { name, date, time, location, description, category };
        const missingFields = Object.entries(requiredFields)
            .filter(([_, value]) => !value)
            .map(([field]) => field);

        if (missingFields.length > 0) {
            console.log('Missing required fields:', missingFields);
            return res.status(400).json({
                message: `Missing required fields: ${missingFields.join(', ')}`,
                missingFields
            });
        }

        const eventDateTime = new Date(`${date}T${time}`);
        if (isNaN(eventDateTime.getTime())) {
            return res.status(400).json({
                message: 'Invalid date or time format'
            });
        }

        let cover_image_url = '';
        const defaultImageUrl = 'https://placehold.jp/150x150.png?text=No+Image';
        if (req.files && req.files.cover_image && req.files.cover_image[0]) {
            cover_image_url = `${req.protocol}://${req.get('host')}/uploads/${req.files.cover_image[0].filename}`;
            console.log('Cover image URL:', cover_image_url);
        } else {
            cover_image_url = defaultImageUrl;
        }

        let final_payment_qr_url = '';
        if (req.files && req.files.payment_qr && req.files.payment_qr[0]) {
            final_payment_qr_url = `${req.protocol}://${req.get('host')}/uploads/${req.files.payment_qr[0].filename}`;
            console.log('Payment QR URL from upload:', final_payment_qr_url);
        } else if (payment_qr_url) {
            final_payment_qr_url = payment_qr_url;
            console.log('Payment QR URL from body:', final_payment_qr_url);
        }

        const event = new Event({
            name,
            date: eventDateTime,
            time,
            location,
            description,
            category,
            registration_fee: Number(registration_fee),
            max_participants: max_participants ? Number(max_participants) : undefined,
            payment_qr_url: final_payment_qr_url,
            cover_image_url,
            house_points: Number(house_points),
            status,
            current_participants: 0 // Initialize with 0 participants
        });

        const createdEvent = await event.save();
        console.log('io object in createEvent:', io);

        // Use the centralized notification utility
        createAndSendNotification(io, {
            title: 'New Event Alert!',
            message: `A new event "${createdEvent.name}" has been scheduled. Check it out!`,
            type: 'event',
            link: `/events/${createdEvent._id}`
        });



        res.status(201).json(createdEvent);
    } catch (error) {
        console.error('Error in createEvent:', error);
        res.status(500).json({ message: 'Server Error', error: error.message, stack: error.stack });
    }
};
const updateEvent = async (req, res) => {
    try {
        console.log('Received event update request:');
        console.log('req.body:', req.body);
        console.log('req.files:', req.files);

        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Update fields from req.body
        event.name = req.body.name || event.name;
        event.date = req.body.date || event.date;
        event.time = req.body.time || event.time;
        event.location = req.body.location || event.location;
        event.description = req.body.description || event.description;
        event.category = req.body.category || event.category;
        event.registration_fee = req.body.registration_fee || event.registration_fee;
        event.max_participants = req.body.max_participants || event.max_participants;
        // If new files are uploaded, update their URLs
        if (req.files && req.files.cover_image && req.files.cover_image[0]) {
            event.cover_image_url = `${req.protocol}://${req.get('host')}/uploads/${req.files.cover_image[0].filename}`;
        } else if (req.body.cover_image_url === '') {
            event.cover_image_url = defaultImageUrl; // Use default placeholder if cleared
        }

        if (req.files && req.files.payment_qr && req.files.payment_qr[0]) {
            event.payment_qr_url = `${req.protocol}://${req.get('host')}/uploads/${req.files.payment_qr[0].filename}`;
        } else if (req.body.payment_qr_url === '') { // Assuming frontend sends empty string to clear
            event.payment_qr_url = '';
        }
        // Remove this line as payment_qr_url is now handled by file upload
        // event.payment_qr_url = req.body.payment_qr_url || event.payment_qr_url;
        event.house_points = req.body.house_points || event.house_points;
        event.status = req.body.status || event.status;

        const updatedEvent = await event.save(); // Save the updated event
        io.emit('updateEvent', updatedEvent);
        res.json(updatedEvent);
    } catch (error) {
        console.error('Error in updateEvent:', error);
        res.status(500).json({ message: 'Server Error', error: error.message, stack: error.stack });
    }
};

// @desc    Delete an event
// @route   DELETE /api/events/:id
// @access  Private/Admin
const deleteEvent = async (req, res) => {
    const io = req.app.get('socketio');
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        await Event.findByIdAndDelete(req.params.id);
        // io.emit('deleteEvent', req.params.id);
        res.json({ message: 'Event removed' });
    } catch (error) {
        console.error('Error in deleteEvent:', error);
        res.status(500).json({ message: 'Server Error', error: error.message, stack: error.stack });
    }
};



// @desc    Get event by ID
// @route   GET /api/events/:id
// @access  Public
const getEventById = async (req, res) => {
    try {
        console.log('Backend received event ID:', req.params.id);
        const event = await Event.findById(req.params.id);

        if (event) {
            res.json(event);
        } else {
            res.status(404).json({ message: 'Event not found' });
        }
    } catch (error) {
        console.error('Error in getEventById:', error);
        res.status(500).json({ message: 'Server Error', error: error.message, stack: error.stack });
    }
};

module.exports = { getEvents, createEvent, updateEvent, deleteEvent, getEventById };
