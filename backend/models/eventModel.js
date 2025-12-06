
const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    time: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        enum: ['Cultural', 'Sports', 'Technical', 'Academic', 'Social'],
        required: true,
    },
    registration_fee: {
        type: Number,
        default: 0,
    },
    max_participants: {
        type: Number,
    },
    payment_qr_url: {
        type: String,
    },
    cover_image_url: {
        type: String,
    },
    house_points: {
        type: Number,
        default: 0,
    },
    status: {
        type: String,
        enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
        default: 'upcoming',
    },
    winner_house_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'House',
    },
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
