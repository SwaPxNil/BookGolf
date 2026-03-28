const express = require('express');
const router = express.Router();
const {
  getUserBookings,
  getAllBookings,
} = require('../controllers/bookingController');
const { authenticate, authorize } = require('../middlewares/auth');

router.route('/').get(authenticate, authorize('COURSE_ADMIN', 'SUPER_ADMIN'), getAllBookings);
router.route('/me').get(authenticate, authorize('USER'), getUserBookings);

module.exports = router;
