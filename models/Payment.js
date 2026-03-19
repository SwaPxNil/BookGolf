const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const PaymentSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: uuidv4,
  },
  booking_id: {
    type: String,
    ref: 'Booking',
    required: [true, 'Please add a booking ID'],
  },
  amount: {
    type: Number,
    required: [true, 'Please add an amount'],
  },
  status: {
    type: String,
    enum: ['PENDING', 'PAID', 'FAILED'],
    default: 'PENDING',
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Payment', PaymentSchema);
