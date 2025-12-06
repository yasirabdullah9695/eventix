
const mongoose = require('mongoose');

const houseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    color: {
        type: String,
        required: true,
    },
    logo_url: {
        type: String,
    },
    points: {
        type: Number,
        default: 0,
    },
    description: {
        type: String,
    },
    winners: [
        {
            leaderPosition: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'LeaderPosition',
            },
            nomination: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Nomination',
            },
        },
    ],
});

const House = mongoose.model('House', houseSchema);

module.exports = House;
