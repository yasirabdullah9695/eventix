
const mongoose = require('mongoose');

const galleryImageSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    image_url: {
        type: String,
        required: true,
    },
    event_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
    },
    year: {
        type: Number,
        required: true,
    },
    month: {
        type: Number,
        required: true,
    },
    category: {
        type: String,
        enum: ['Events', 'Sports', 'Cultural', 'Academic', 'Campus Life'],
        required: true,
    },
});

const GalleryImage = mongoose.model('GalleryImage', galleryImageSchema);

module.exports = GalleryImage;
