const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const UserSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: uuidv4,
  },
  full_name: {
    type: String,
    required: [true, 'Please add a name'],
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email',
    ],
  },
  profile_img: {
    type: String,
  },
  password_hash: {
    type: String,
    required: [true, 'Please add a password hash'],
  },
  two_factor_code: {
    type: String,
  },
  two_factor_code_expires: {
    type: Date,
  },
  role: {
    type: String,
    enum: ['USER', 'COURSE_ADMIN', 'SUPER_ADMIN'],
    default: 'USER',
  },
  is_2fa_verified: {
    type: Boolean,
    default: false,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('User', UserSchema);
