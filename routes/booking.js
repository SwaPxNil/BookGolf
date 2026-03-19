const express = require('express');
const router = express.Router();
const {
  getUserBookings,
} = require('../controllers/bookingController');
const { authenticate, authorize } = require('../middlewares/auth');

router.route('/me').get(authenticate, authorize('USER'), getUserBookings);

module.exports = router;
