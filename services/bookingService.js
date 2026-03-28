const Booking = require('../models/Booking');

const bookingPopulate = [
  { path: 'user_id', select: 'full_name email role' },
  { path: 'course_id', select: 'name location tee_time_price status' },
  { path: 'tee_time_id', select: 'slot_time price status course_id' },
  { path: 'coach_id', select: 'full_name specialization lessons profile_img' },
  { path: 'caddie_id', select: 'full_name speciality experience experience_years profile_img rating' },
];

const enrichBooking = (booking) => {
  const plainBooking = typeof booking?.toObject === 'function' ? booking.toObject() : booking;
  if (!plainBooking) {
    return plainBooking;
  }

  if (plainBooking.booking_type === 'COACH' && plainBooking.coach_id?.lessons?.length) {
    const lesson = plainBooking.coach_id.lessons.find(
      (item) => String(item?._id) === String(plainBooking.lesson_id)
    );

    if (lesson) {
      plainBooking.lesson = lesson;
    }
  }

  if (!plainBooking.slot && plainBooking.tee_time_id?.slot_time) {
    plainBooking.slot = plainBooking.tee_time_id.slot_time;
  }

  return plainBooking;
};

const getUserBookings = async (userId) => {
  const bookings = await Booking.find({ user_id: userId })
    .sort({ created_at: -1 })
    .populate(bookingPopulate);

  return bookings.map(enrichBooking);
};

const getAllBookings = async (options = {}) => {
  const { limit } = options;
  const query = Booking.find({})
    .sort({ created_at: -1 })
    .populate(bookingPopulate);

  if (typeof limit === 'number' && limit > 0) {
    query.limit(limit);
  }

  const bookings = await query;
  return bookings.map(enrichBooking);
};

module.exports = {
  getUserBookings,
  getAllBookings,
};
