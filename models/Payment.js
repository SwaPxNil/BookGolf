const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const PaymentSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: uuidv4,
  },
  user_id: {
    type: String,
    ref: 'User',
    required: [true, 'Please add a user ID'],
  },
  booking_id: {
    type: String,
    ref: 'Booking',
    default: null,
  },
  booking_type: {
    type: String,
    enum: ['TEE_TIME', 'COACH', 'CADDIE'],
    required: [true, 'Please add a booking type'],
  },
  payment_method: {
    type: String,
    enum: ['ESEWA', 'KHALTI'],
    required: [true, 'Please add a payment method'],
  },
  amount: {
    type: Number,
    required: [true, 'Please add an amount'],
  },
  total_amount: {
    type: Number,
    required: [true, 'Please add a total amount'],
  },
  status: {
    type: String,
    enum: ['PENDING', 'PAID', 'FAILED'],
    default: 'PENDING',
  },
  provider_transaction_id: {
    type: String,
  },
  verification_reference: {
    type: String,
  },
  verified_at: {
    type: Date,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Payment', PaymentSchema);
