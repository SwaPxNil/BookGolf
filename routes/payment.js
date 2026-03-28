const express = require('express');
const router = express.Router();
const {
  getUserPayments,
  processAdvanceBookingPayment,
} = require('../controllers/paymentController');
const { authenticate, authorize } = require('../middlewares/auth');

router.route('/me').get(authenticate, authorize('USER'), getUserPayments);
router.route('/bookings/advance').post(authenticate, authorize('USER'), processAdvanceBookingPayment);

module.exports = router;
