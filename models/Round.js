const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const RoundSchema = new mongoose.Schema({
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
  round_date: {
    type: Date,
    required: [true, 'Please add a round date'],
  },
  total_score: {
    type: Number,
    required: [true, 'Please add a total score'],
  },
  hole_scores: {
    type: [Number],
    default: [],
  },
});

module.exports = mongoose.model('Round', RoundSchema);
