
const mongoose = require('mongoose');

const nominationSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    position_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LeaderPosition',
        required: true,
    },
    event_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
    },
    manifesto: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
    },
    photo: {
        type: String,
    },
    house: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'House',
        required: true,
    },
    isWinner: {
        type: Boolean,
        default: false,
    },
    voteCount: {
        type: Number,
        default: 0,
    }
});

const Nomination = mongoose.model('Nomination', nominationSchema);

module.exports = Nomination;
