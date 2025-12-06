const Payment = require('../models/paymentModel');
const Registration = require('../models/registrationModel');

exports.verifyPayment = async (req, res) => {
  const { registration_id, transaction_id, amount, payment_method } = req.body;

  try {
    // Create a new payment document
    const payment = new Payment({
      registration_id,
      transaction_id,
      amount,
      payment_method,
      payment_status: 'completed',
    });

    await payment.save();

    // Update the registration to mark it as payment verified
    await Registration.findByIdAndUpdate(registration_id, { payment_verified: true });

    res.status(200).json({ message: 'Payment verified successfully' });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
