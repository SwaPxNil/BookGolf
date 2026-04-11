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

// @desc    Get recent lesson bookings for current user
// @route   GET /api/bookings/me/recent-lessons
// @access  Private (USER)
const getRecentUserLessons = async (req, res, next) => {
  try {
    const bookings = await bookingService.getRecentUserLessons(req.user.id, 5);
    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get recent caddie bookings for current user
// @route   GET /api/bookings/me/recent-caddies
// @access  Private (USER)
const getRecentUserCaddies = async (req, res, next) => {
  try {
    const bookings = await bookingService.getRecentUserCaddies(req.user.id, 4);
    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Cancel current user's booking
// @route   PATCH /api/bookings/me/:id/cancel
// @access  Private (USER)
const cancelUserBooking = async (req, res, next) => {
  try {
    const booking = await bookingService.cancelBookingByUser(req.params.id, req.user.id);
    if (!booking) {
      return res.status(404).json({ success: false, msg: 'Booking not found' });
    }

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Rate current user's completed coach/caddie booking
// @route   PATCH /api/bookings/me/:id/rate
// @access  Private (USER)
const rateUserBooking = async (req, res, next) => {
  try {
    const rating = Number(req.body?.rating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, msg: 'Rating must be an integer between 1 and 5' });
    }

    const booking = await bookingService.rateBookingByUser(req.params.id, req.user.id, rating);
    if (!booking) {
      return res.status(404).json({ success: false, msg: 'Booking not found' });
    }

    res.status(200).json({
      success: true,
      data: booking,
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
    const bookings = await bookingService.getAllBookings({ actor: req.user });
    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update booking by admin/super-admin
// @route   PUT /api/bookings/:id
// @access  Private (COURSE_ADMIN, SUPER_ADMIN)
const updateBookingByAdmin = async (req, res, next) => {
  try {
    const booking = await bookingService.updateBookingByAdmin(req.params.id, req.body, req.user);
    if (!booking) {
      return res.status(404).json({ success: false, msg: 'Booking not found' });
    }

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Cancel booking by admin/super-admin
// @route   PATCH /api/bookings/:id/cancel
// @access  Private (COURSE_ADMIN, SUPER_ADMIN)
const cancelBookingByAdmin = async (req, res, next) => {
  try {
    const booking = await bookingService.cancelBookingByAdmin(req.params.id, req.body, req.user);
    if (!booking) {
      return res.status(404).json({ success: false, msg: 'Booking not found' });
    }

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete booking by admin/super-admin
// @route   DELETE /api/bookings/:id
// @access  Private (COURSE_ADMIN, SUPER_ADMIN)
const deleteBookingByAdmin = async (req, res, next) => {
  try {
    const booking = await bookingService.deleteBookingByAdmin(req.params.id, req.user);
    if (!booking) {
      return res.status(404).json({ success: false, msg: 'Booking not found' });
    }

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getUserBookings,
  getRecentUserLessons,
  getRecentUserCaddies,
  cancelUserBooking,
  rateUserBooking,
  getAllBookings,
  updateBookingByAdmin,
  cancelBookingByAdmin,
  deleteBookingByAdmin,
};
