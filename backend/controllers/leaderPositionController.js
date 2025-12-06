
const LeaderPosition = require('../models/leaderPositionModel');

// @desc    Get all leader positions
// @route   GET /api/positions
// @access  Public
const getLeaderPositions = async (req, res) => {
    try {
        console.log('Attempting to fetch leader positions for user:', req.user._id);
        const filter = {};
        if (req.query.event_id) {
            filter.event_id = req.query.event_id;
        }

        // Filter positions based on the user's house
        if (req.user && req.user.house_id) {
            filter.$or = [
                { house_id: null }, // Global positions
                { house_id: req.user.house_id._id } // Positions for the user's house
            ];
        } else if (req.user && !req.user.house_id) {
            // User exists but has no house, only show global positions
            filter.house_id = null;
        } else if (!req.user) {
            // Should not happen if 'protect' middleware is used, but as a fallback
            return res.status(401).json({ message: 'Not authorized' });
        }

        const positions = await LeaderPosition.find(filter).sort({ priority: 1 });
        console.log(`Successfully fetched ${positions.length} leader positions.`);
        res.json(positions);
    } catch (error) {
        console.error('Error in getLeaderPositions:', error.message, error.stack); // Explicitly log message and stack
        res.status(500).json({ message: 'Server Error', error: error.message, stack: error.stack });
    }
};

// @desc    Create a leader position
// @route   POST /api/positions
// @access  Private/Admin
const createLeaderPosition = async (req, res) => {
    try {
        const position = new LeaderPosition(req.body);
        const createdPosition = await position.save();
        res.status(201).json(createdPosition);
    } catch (error) {
        console.error('Error in createLeaderPosition:', error); // Log the actual error
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get voting results
// @route   GET /api/positions/voting-results
// @access  Public
const getVotingResults = async (req, res) => {
    try {
        const results = await LeaderPosition.find({ winner: { $exists: true, $ne: null } })
            .populate({
                path: 'nomination',
                populate: {
                    path: 'user_id',
                    select: 'full_name photo',
                },
            })
            .populate('event_id', 'name')
            .sort({ priority: 1 });
        res.json(results);
    } catch (error) {
        console.error('Error in getVotingResults:', error); // Log the actual error
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { getLeaderPositions, createLeaderPosition, getVotingResults };
