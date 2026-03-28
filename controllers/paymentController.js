const paymentService = require('../services/paymentService');
const bookingPaymentService = require('../services/bookingPaymentService');

// @desc    Get user's payments
// @route   GET /api/payments/me
// @access  Private (USER)
const getUserPayments = async (req, res, next) => {
  try {
    const payments = await paymentService.getUserPayments(req.user.id);
    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Process advance payment and confirm booking
// @route   POST /api/payments/bookings/advance
// @access  Private (USER)
const processAdvanceBookingPayment = async (req, res, next) => {
  try {
    const result = await bookingPaymentService.processAdvanceBookingPayment(req.user, req.body);

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getUserPayments,
  processAdvanceBookingPayment,
};
