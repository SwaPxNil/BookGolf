const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const CourseSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: uuidv4,
  },
  name: {
    type: String,
    required: [true, 'Please add a course name'],
    unique: true,
    trim: true,
    maxlength: [50, 'Name can not be more than 50 characters'],
  },
  location: {
    type: String,
    required: [true, 'Please add a location'],
  },
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    default: 'PENDING',
  },
  slope_rating: {
    type: Number,
    required: [true, 'Please add a slope rating'],
  },
  course_rating: {
    type: Number,
    required: [true, 'Please add a course rating'],
  },
  tee_time_price: {
    type: Number,
    required: [true, 'Please add a tee time price'],
    min: [0, 'Tee time price cannot be negative'],
  },
  image_url: {
    type: String,
  },
  hole_layouts: [
    {
      hole_number: {
        type: Number,
        required: true,
      },
      image_url: {
        type: String,
        required: true,
      },
    },
  ],
  created_by: {
    type: String,
    ref: 'User',
    default: null,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Course', CourseSchema);
