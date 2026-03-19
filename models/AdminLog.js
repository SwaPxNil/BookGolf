const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const AdminLogSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: uuidv4,
  },
  actor_id: {
    type: String,
    ref: 'User',
    required: [true, 'Please add an actor ID'],
  },
  action: {
    type: String,
    required: [true, 'Please add an action description'],
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed, // Stores any type of data
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('AdminLog', AdminLogSchema);
