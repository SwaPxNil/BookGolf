const express = require('express');
const router = express.Router();
const {
  getUserPayments,
  processAdvanceBookingPayment,
  initiateAdvanceBookingPayment,
  verifyEsewaPayment,
  verifyKhaltiPayment,
  renderEsewaCheckoutPage,
  handleEsewaSuccessRedirect,
  handleEsewaFailureRedirect,
  handleKhaltiReturn,
} = require('../controllers/paymentController');
const { authenticate, authorize } = require('../middlewares/auth');

router.route('/me').get(authenticate, authorize('USER'), getUserPayments);
router.route('/bookings/advance').post(authenticate, authorize('USER'), processAdvanceBookingPayment);
router.route('/bookings/advance/initiate').post(authenticate, authorize('USER'), initiateAdvanceBookingPayment);
router.route('/esewa/verify').post(authenticate, authorize('USER'), verifyEsewaPayment);
router.route('/khalti/verify').post(authenticate, authorize('USER'), verifyKhaltiPayment);

router.route('/esewa/checkout/:paymentId').get(renderEsewaCheckoutPage);
router.route('/esewa/success/:paymentId').get(handleEsewaSuccessRedirect);
router.route('/esewa/failure/:paymentId').get(handleEsewaFailureRedirect);
router.route('/esewa/success').get(handleEsewaSuccessRedirect);
router.route('/esewa/failure').get(handleEsewaFailureRedirect);
router.route('/khalti/return').get(handleKhaltiReturn);

module.exports = router;
