const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const LessonSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: uuidv4,
  },
  title: {
    type: String,
    required: [true, 'Please add a lesson title'],
  },
  duration_minutes: {
    type: Number,
    required: [true, 'Please add lesson duration in minutes'],
  },
  price: {
    type: Number,
    required: [true, 'Please add lesson price'],
  },
});

const calculateRecommendationValue = (rating = 0, studentsTaught = 0) => {
  const safeRating = Number(rating) > 0 ? Number(rating) : 0;
  const safeStudents = Number(studentsTaught) > 0 ? Number(studentsTaught) : 0;

  const normalizedRating = Math.min(5, safeRating) / 5;
  const normalizedStudentTrust = Math.min(1, Math.log10(safeStudents + 1) / 2);

  const score = (normalizedRating * 0.75 + normalizedStudentTrust * 0.25) * 100;
  return Number(score.toFixed(2));
};

const CoachSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: uuidv4,
  },
  full_name: {
    type: String,
    required: [true, 'Please add coach full name'],
  },
  specialization: {
    type: String,
    required: [true, 'Please add coach specialization'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description can not be more than 1000 characters'],
  },
  experience_years: {
    type: Number,
    required: [true, 'Please add coach experience in years'],
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
  reviews_count: {
    type: Number,
    min: [0, 'Reviews count cannot be negative'],
    default: 0,
  },
  students_taught: {
    type: Number,
    min: [0, 'Students taught cannot be negative'],
    default: 0,
  },
  recommendation_value: {
    type: Number,
    min: [0, 'Recommendation value cannot be negative'],
    default: 0,
  },
  course_id: {
    type: String,
    ref: 'Course',
  },
  created_by: {
    type: String,
    ref: 'User',
  },
  lessons: [LessonSchema],
});

CoachSchema.statics.calculateRecommendationValue = calculateRecommendationValue;

CoachSchema.pre('save', function(next) {
  this.recommendation_value = calculateRecommendationValue(this.rating, this.students_taught);
});

module.exports = mongoose.model('Coach', CoachSchema);
