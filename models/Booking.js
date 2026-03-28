const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const BookingSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: uuidv4,
  },
  user_id: {
    type: String,
    ref: 'User',
    required: [true, 'Please add a user ID'],
  },
  booking_type: {
    type: String,
    enum: ['TEE_TIME', 'COACH', 'CADDIE'],
    required: [true, 'Please add a booking type'],
  },
  course_id: {
    type: String,
    ref: 'Course',
    required: function() {
      // Only required for TEE_TIME bookings
      return this.booking_type === 'TEE_TIME';
    },
  },
  tee_time_id: {
    type: String,
    ref: 'TeeTime',
    required: function() {
      return this.booking_type === 'TEE_TIME';
    },
  },
  coach_id: {
    type: String,
    ref: 'Coach',
    required: function() {
      return this.booking_type === 'COACH';
    },
  },
  lesson_id: {
    type: String,
    // Note: If lesson_id refers to an embedded document, it might not be a direct ref.
    // Assuming for now it's a string, and we'll handle validation for embedded docs later.
    required: function() {
      return this.booking_type === 'COACH';
    },
  },
  caddie_id: {
    type: String,
    ref: 'Caddie',
    required: function() {
      return this.booking_type === 'CADDIE';
    },
  },
  slot: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['CONFIRMED', 'CANCELLED'],
    default: 'CONFIRMED',
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Booking', BookingSchema);
