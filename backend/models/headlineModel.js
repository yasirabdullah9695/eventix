
const mongoose = require('mongoose');

const headlineSchema = new mongoose.Schema({
    message: {
        type: String,
        required: true,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

headlineSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const Headline = mongoose.model('Headline', headlineSchema);

module.exports = Headline;
