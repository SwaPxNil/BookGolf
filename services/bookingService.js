const Booking = require('../models/Booking');

const getUserBookings = async (userId) => {
    const bookings = await Booking.find({ user_id: userId })
        .populate('course_id')
        .populate('tee_time_id')
        .populate('coach_id')
        .populate('caddie_id')
        .lean(); // Use lean for faster queries if you don't need Mongoose documents

    return bookings;
};

module.exports = {
  getUserBookings,
};
