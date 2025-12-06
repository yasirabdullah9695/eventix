
const mongoose = require('mongoose');

const leaderPositionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    priority: {
        type: Number,
        required: true,
    },
    houseWinners: {
        type: [{
            house: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'House',
                required: true
            },
            nomination: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Nomination',
                required: true
            },
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            }
        }],
        default: []
    },
    house_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'House',
    },
    event_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
    },
    overallWinner: {
        type: {
            nomination: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Nomination',
            },
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            }
        },
        default: null,
    },
    voting_starts_at: {
        type: Date,
        default: null,
    },
    voting_ends_at: {
        type: Date,
        default: null,
    }
});

const LeaderPosition = mongoose.model('LeaderPosition', leaderPositionSchema);

module.exports = LeaderPosition;
