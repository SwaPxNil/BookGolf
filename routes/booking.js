const express = require('express');
const router = express.Router();
const {
  getUserBookings,
  getRecentUserLessons,
  getRecentUserCaddies,
  cancelUserBooking,
  rateUserBooking,
  getAllBookings,
  updateBookingByAdmin,
  cancelBookingByAdmin,
  deleteBookingByAdmin,
} = require('../controllers/bookingController');
const { authenticate, authorize } = require('../middlewares/auth');

router.route('/').get(authenticate, authorize('COURSE_ADMIN', 'SUPER_ADMIN'), getAllBookings);
router.route('/me').get(authenticate, authorize('USER'), getUserBookings);
router.route('/me/recent-lessons').get(authenticate, authorize('USER'), getRecentUserLessons);
router.route('/me/recent-caddies').get(authenticate, authorize('USER'), getRecentUserCaddies);
router.route('/me/:id/cancel').patch(authenticate, authorize('USER'), cancelUserBooking);
router.route('/me/:id/rate').patch(authenticate, authorize('USER'), rateUserBooking);
router
  .route('/:id')
  .put(authenticate, authorize('COURSE_ADMIN', 'SUPER_ADMIN'), updateBookingByAdmin)
  .delete(authenticate, authorize('COURSE_ADMIN', 'SUPER_ADMIN'), deleteBookingByAdmin);
router
  .route('/:id/cancel')
  .patch(authenticate, authorize('COURSE_ADMIN', 'SUPER_ADMIN'), cancelBookingByAdmin);

module.exports = router;
