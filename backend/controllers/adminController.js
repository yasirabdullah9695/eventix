const User = require('../models/userModel');
const Nomination = require('../models/nominationModel');
const LeaderPosition = require('../models/leaderPositionModel');
const Registration = require('../models/registrationModel');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createAndSendNotification } = require('../utils/notificationUtils');

// @desc    Create a new user by admin
// @route   POST /api/admin/users
// @access  Private/Admin
const createUser = async (req, res) => {
    const { full_name, email, password, phone, branch, year, house_id, enrollment_number, role } = req.body;

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            full_name,
            email,
            password: hashedPassword,
            phone,
            branch,
            year,
            house_id,
            enrollment_number,
            role: role || 'student', // Allow admin to specify role, default to student
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                full_name: user.full_name,
                email: user.email,
                phone: user.phone,
                branch: user.branch,
                year: user.year,
                house_id: user.house_id,
                enrollment_number: user.enrollment_number,
                role: user.role,
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Declare a winner for a nomination
// @route   PUT /api/admin/nominations/:id/declare-winner
// @access  Private/Admin
const declareWinner = async (req, res) => {
    try {
        const nominationId = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(nominationId)) {
            console.log('declareWinner: Invalid Nomination ID format');
            return res.status(400).json({ message: 'Invalid Nomination ID format' });
        }
        console.log('declareWinner: Starting execution for nomination ID:', nominationId);
        const nomination = await Nomination.findById(nominationId);
        console.log('declareWinner: Nomination found:', nomination ? nomination._id : 'None');

        if (!nomination) {
            console.log('declareWinner: Nomination not found, returning 404');
            return res.status(404).json({ message: 'Nomination not found' });
        }

        console.log('declareWinner: Finding LeaderPosition for position ID:', nomination.position_id);
        const leaderPosition = await LeaderPosition.findById(nomination.position_id);
        console.log('declareWinner: LeaderPosition found:', leaderPosition ? leaderPosition._id : 'None');

        if (!leaderPosition) {
            console.log('declareWinner: Leader position not found, returning 404');
            return res.status(404).json({ message: 'Leader position not found' });
        }

        // Check if a winner has already been declared for this position (either overall or for a specific house)
        if (leaderPosition.house_id) { // Position is house-specific based on the position's house_id
            const existingHouseWinner = leaderPosition.houseWinners.find(hw => hw.house.toString() === nomination.house.toString());
            if (existingHouseWinner) {
                console.log('declareWinner: Winner already declared for this house and position, returning 400');
                return res.status(400).json({ message: 'Winner already declared for this house and position' });
            }
        } else { // Position is global
            if (leaderPosition.overallWinner && leaderPosition.overallWinner.user) {
                console.log('declareWinner: Overall winner already declared for this position, returning 400');
                return res.status(400).json({ message: 'Overall winner already declared for this position' });
            }
        }

        if (!mongoose.Types.ObjectId.isValid(nomination.position_id)) {
            console.log('declareWinner: Invalid Position ID format in nomination, returning 400');
            return res.status(400).json({ message: 'Invalid Position ID format in nomination' });
        }

        if (nomination.house && !mongoose.Types.ObjectId.isValid(nomination.house)) {
            console.log('declareWinner: Invalid house ID in nomination, returning 400');
            return res.status(400).json({ message: 'Invalid house ID in nomination' });
        }

        console.log('declareWinner: Updating LeaderPosition winner fields');
        if (leaderPosition.house_id) { // If the LeaderPosition itself has a house_id, it's a house-specific position
            leaderPosition.houseWinners.push({
                house: nomination.house, // The house from the winning nomination
                nomination: nomination._id,
                user: nomination.user_id
            });
        } else { // It's a global position
            leaderPosition.overallWinner = {
                nomination: nomination._id,
                user: nomination.user_id
            };
        }
        await leaderPosition.save();
        console.log('declareWinner: LeaderPosition saved successfully with winner information');

        console.log('declareWinner: Setting isWinner to true for current nomination');
        nomination.isWinner = true;
        await nomination.save();
        console.log('declareWinner: Current nomination saved successfully');

        console.log('declareWinner: Setting isWinner to false for other nominations in the same position');
        await Nomination.updateMany(
            {
                position_id: nomination.position_id,
                _id: { $ne: nomination._id },
            },
            { isWinner: false }
        );
        console.log('declareWinner: Other nominations updated successfully');

        const io = req.app.get('socketio');
        if (io) {
            console.log('declareWinner: Emitting winnerDeclared socket event');
            io.emit('winnerDeclared', { position_id: leaderPosition._id });

            // Send notification to all users
            createAndSendNotification(io, {
                title: 'Election Result Declared!',
                message: `The winner for the ${leaderPosition.title} position has been declared.`,
                type: 'leaderboard',
                link: '/voting-results'
            });
        } else {
            console.warn('declareWinner: Socket.io instance not found on req.app');
        }

        console.log('declareWinner: Winner declared successfully, sending 200 response');
        res.json({ message: 'Winner declared successfully' });
    } catch (error) {
        console.error('declareWinner: An unexpected error occurred:', error);
        if (error.name === 'ValidationError') {
            console.error('declareWinner: Mongoose Validation Error:', error.message);
            res.status(400).json({ message: 'Validation Error', details: error.message });
        } else if (error.name === 'CastError') {
            console.error('declareWinner: Mongoose Cast Error (Invalid ID):', error.message);
            res.status(400).json({ message: 'Invalid ID format', details: error.message });
        } else {
            res.status(500).json({ message: 'Server Error', error: error.message, stack: error.stack });
        }
    }
};

// @desc    Verify a ticket by registration ID
// @route   POST /api/admin/verify-ticket
// @access  Private/Admin
const verifyTicket = async (req, res) => {
    const { registration_id } = req.body; // This will be the ticket_id from the QR code

    try {
        const registration = await Registration.findOne({ ticket_id: registration_id }).populate('user_id').populate('event_id');

        if (!registration) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        if (registration.event_id.registration_fee > 0 && !registration.payment_verified) {
            return res.status(400).json({ message: 'Payment not verified' });
        }

        if (registration.scanned) {
            return res.status(400).json({ message: 'Ticket already used' });
        }

        registration.scanned = true;
        await registration.save();

        res.json({
            message: 'Ticket verified successfully',
            registration,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Verify a payment for a registration
// @route   PUT /api/admin/registrations/:id/verify-payment
// @access  Private/Admin
const verifyPayment = async (req, res) => {
    try {
        const registration = await Registration.findById(req.params.id);

        if (!registration) {
            return res.status(404).json({ message: 'Registration not found' });
        }

        if (registration.payment_verified) {
            return res.status(400).json({ message: 'Payment already verified' });
        }

        registration.payment_verified = true;
        registration.payment_verified_by = req.user.id; // Admin who verified
        registration.payment_verified_at = new Date();

        const updatedRegistration = await registration.save();

        res.json({
            message: 'Payment verified successfully',
            registration: updatedRegistration,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { createUser, declareWinner, verifyTicket, verifyPayment };
