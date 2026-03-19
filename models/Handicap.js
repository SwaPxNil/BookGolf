const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const HandicapSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: uuidv4,
  },
  user_id: {
    type: String,
    ref: 'User',
    required: [true, 'Please add a user ID'],
  },
  course_id: {
    type: String,
    ref: 'Course',
    required: [true, 'Please add a course ID'],
  },
  handicap_value: {
    type: Number,
    required: [true, 'Please add a handicap value'],
  },
  calculated_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Handicap', HandicapSchema);
