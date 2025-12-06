
const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
    event_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true,
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    student_name: {
        type: String,
        required: true,
    },
    student_email: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    branch: {
        type: String,
        required: true,
    },
    house_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'House',
        required: false, // Changed from true to false
    },
    payment_screenshot_url: {
        type: String,
    },
    payment_verified: {
        type: Boolean,
        default: false,
    },
    ticket_id: {
        type: String,
    },
    attendance_marked: {
        type: Boolean,
        default: false,
    },
    transaction_id: {
        type: String,
    },
    payment_verified_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    payment_verified_at: {
        type: Date,
    },
    scanned: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

registrationSchema.index({ user_id: 1, event_id: 1 });

const Registration = mongoose.model('Registration', registrationSchema);

module.exports = Registration;
