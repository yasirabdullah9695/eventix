
const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    house_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'House',
        required: true,
    },
    position_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LeaderPosition',
        required: true,
    },
    nomination_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Nomination',
        required: true,
    },
}, { timestamps: true });

// Ensure a user can only vote once per position
voteSchema.index({ user_id: 1, position_id: 1 }, { unique: true });

const Vote = mongoose.model('Vote', voteSchema);

module.exports = Vote;
