const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const CaddieSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: uuidv4,
  },
  full_name: {
    type: String,
    required: [true, 'Please add caddie full name'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description can not be more than 1000 characters'],
  },
  experience: {
    type: Number,
    min: [0, 'Experience cannot be negative'],
  },
  experience_years: { // <-- ADDED THIS BACK
    type: Number,
    min: [0, 'Experience years cannot be negative'],
  },
  availability_slots: {
    type: [Date],
    default: [],
  },
  profile_img: {
    type: String,
  },
  image_url: { 
    type: String,
  },
  rating: {
    type: Number,
    min: [0, 'Rating cannot be less than 0'],
    max: [5, 'Rating cannot be greater than 5'],
    default: 0,
  },
  matches_caddied: {
    type: Number,
    min: [0, 'Matches caddied cannot be negative'],
    default: 0,
  },
  speciality: {
    type: String,
  }
});

CaddieSchema.pre('validate', function(next) {
  if (typeof this.experience === 'number' && typeof this.experience_years !== 'number') {
    this.experience_years = this.experience;
  }

  if (typeof this.experience_years === 'number' && typeof this.experience !== 'number') {
    this.experience = this.experience_years;
  }

  if (typeof this.experience !== 'number' && typeof this.experience_years !== 'number') {
    throw new Error('Please add caddie experience');
  }
});

module.exports = mongoose.model('Caddie', CaddieSchema);