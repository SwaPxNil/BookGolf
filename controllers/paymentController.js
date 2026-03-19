const paymentService = require('../services/paymentService');

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

module.exports = {
  getUserPayments,
};
