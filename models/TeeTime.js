const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const TeeTimeSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: uuidv4,
  },
  course_id: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Course",
  required: true,
  },
  slot_time: {
    type: Date,
    required: [true, 'Please add a slot time'],
  },
  price: {
    type: Number,
    // required: [true, 'Please add a price'],
  },
  status: {
    type: String,
    enum: ['AVAILABLE', 'BOOKED'],
    default: 'AVAILABLE',
  },
});

module.exports = mongoose.model('TeeTime', TeeTimeSchema);
