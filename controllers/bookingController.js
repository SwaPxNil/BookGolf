const bookingService = require('../services/bookingService');

// @desc    Get user's bookings
// @route   GET /api/bookings/me
// @access  Private (USER)
const getUserBookings = async (req, res, next) => {
  try {
    const bookings = await bookingService.getUserBookings(req.user.id);
    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Private (COURSE_ADMIN, SUPER_ADMIN)
const getAllBookings = async (req, res, next) => {
  try {
    const bookings = await bookingService.getAllBookings();
    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getUserBookings,
  getAllBookings,
};
