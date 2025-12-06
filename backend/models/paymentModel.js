const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  registration_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Registration',
    required: true,
  },
  transaction_id: {
    type: String,
    required: true,
    unique: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  payment_method: {
    type: String,
    required: true,
  },
  payment_status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending',
  },
}, { timestamps: true });

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;
