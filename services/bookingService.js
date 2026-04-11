const Booking = require('../models/Booking');
const Course = require('../models/Course');
const Payment = require('../models/Payment');
const TeeTime = require('../models/TeeTime');
const User = require('../models/User');
const Coach = require('../models/Coach');
const Caddie = require('../models/Caddie');
const { sendBookingCancellationEmail } = require('../utils/bookingEmail');

const bookingPopulate = [
  { path: 'user_id', select: 'full_name email role' },
  { path: 'course_id', select: 'name location tee_time_price status image_url' },
  { path: 'tee_time_id', select: 'slot_time price status course_id' },
  {
    path: 'coach_id',
    select: 'full_name specialization lessons profile_img image_url course_id',
    populate: {
      path: 'course_id',
      select: 'name location image_url',
    },
  },
  {
    path: 'caddie_id',
    select: 'full_name speciality experience experience_years profile_img image_url rating course_id',
    populate: {
      path: 'course_id',
      select: 'name location image_url',
    },
  },
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

  const lesson = plainBooking.lesson || null;
  plainBooking.booking_datetime = plainBooking.slot || plainBooking.created_at;
  plainBooking.service_details = {
    type: plainBooking.booking_type,
    course: plainBooking.course_id
      || plainBooking.coach_id?.course_id
      || plainBooking.caddie_id?.course_id
      || null,
    coach: plainBooking.coach_id || null,
    caddie: plainBooking.caddie_id || null,
    lesson: lesson
      ? {
          _id: lesson._id,
          title: lesson.title,
          duration_minutes: lesson.duration_minutes,
          price: lesson.price,
        }
      : null,
  };

  return plainBooking;
};

const attachLatestPaidPayment = async (bookings, userId) => {
  if (!Array.isArray(bookings) || bookings.length === 0) {
    return bookings;
  }

  const bookingIds = bookings.map((booking) => String(booking._id));
  const paidPayments = await Payment.find({
    user_id: userId,
    booking_id: { $in: bookingIds },
    status: 'PAID',
  })
    .sort({ created_at: -1 })
    .lean();

  const latestPaidByBooking = new Map();
  for (const payment of paidPayments) {
    const key = String(payment.booking_id);
    if (!latestPaidByBooking.has(key)) {
      latestPaidByBooking.set(key, payment);
    }
  }

  return bookings.map((booking) => {
    const enriched = { ...booking };
    const payment = latestPaidByBooking.get(String(booking._id)) || null;

    enriched.payment = payment
      ? {
          _id: payment._id,
          status: payment.status,
          payment_method: payment.payment_method,
          paid_amount: payment.amount,
          total_amount: payment.total_amount,
          paid_at: payment.created_at,
        }
      : null;

    return enriched;
  });
};

const getUserBookings = async (userId) => {
  const bookings = await Booking.find({
    user_id: userId,
    status: { $ne: 'CANCELLED' },
  })
    .sort({ created_at: -1 })
    .populate(bookingPopulate);

  const enrichedBookings = bookings.map(enrichBooking);
  return attachLatestPaidPayment(enrichedBookings, userId);
};

const getRecentUserLessons = async (userId, limit = 5) => {
  const bookings = await Booking.find({
    user_id: userId,
    booking_type: 'COACH',
    status: { $ne: 'CANCELLED' },
  })
    .sort({ created_at: -1 })
    .limit(limit)
    .populate(bookingPopulate);

  const enrichedBookings = bookings.map(enrichBooking);
  return attachLatestPaidPayment(enrichedBookings, userId);
};

const getRecentUserCaddies = async (userId, limit = 4) => {
  const bookings = await Booking.find({
    user_id: userId,
    booking_type: 'CADDIE',
    status: { $ne: 'CANCELLED' },
  })
    .sort({ created_at: -1 })
    .limit(limit)
    .populate(bookingPopulate);

  const enrichedBookings = bookings.map(enrichBooking);
  return attachLatestPaidPayment(enrichedBookings, userId);
};

const cancelBookingByUser = async (bookingId, userId) => {
  const booking = await Booking.findOne({ _id: bookingId, user_id: userId });
  if (!booking) {
    return null;
  }

  if (booking.status === 'CANCELLED') {
    const existingBooking = await Booking.findById(booking._id).populate(bookingPopulate);
    const enrichedExistingBooking = enrichBooking(existingBooking);
    const [withPayment] = await attachLatestPaidPayment([enrichedExistingBooking], userId);
    return withPayment;
  }

  booking.status = 'CANCELLED';
  await booking.save();

  if (booking.booking_type === 'TEE_TIME' && booking.tee_time_id) {
    const teeTime = await TeeTime.findById(booking.tee_time_id);
    if (teeTime) {
      const teeTimeSlot = teeTime.slot_time ? new Date(teeTime.slot_time) : null;
      const bookingSlot = booking.slot ? new Date(booking.slot) : null;
      const isTemplateSlotBooking =
        teeTimeSlot
        && bookingSlot
        && !Number.isNaN(teeTimeSlot.getTime())
        && !Number.isNaN(bookingSlot.getTime())
        && teeTimeSlot.getTime() === bookingSlot.getTime();

      if (isTemplateSlotBooking && teeTime.status !== 'AVAILABLE') {
        teeTime.status = 'AVAILABLE';
        await teeTime.save();
      }
    }
  }

  try {
    const user = await User.findById(userId).select('full_name email').lean();
    const refreshedForMail = await Booking.findById(booking._id).populate(bookingPopulate);
    const enrichedForMail = enrichBooking(refreshedForMail);

    const serviceName =
      enrichedForMail?.service_details?.lesson?.title
      || enrichedForMail?.service_details?.course?.name
      || enrichedForMail?.service_details?.coach?.full_name
      || enrichedForMail?.service_details?.caddie?.full_name
      || 'Booking Service';

    await sendBookingCancellationEmail({
      email: user?.email,
      fullName: user?.full_name,
      bookingType: enrichedForMail?.booking_type,
      serviceName,
      slot: enrichedForMail?.slot || enrichedForMail?.booking_datetime,
    });
  } catch (emailError) {
    console.error('Booking cancellation email failed:', emailError.message);
  }

  const refreshed = await Booking.findById(booking._id).populate(bookingPopulate);
  const enrichedBooking = enrichBooking(refreshed);
  const [withPayment] = await attachLatestPaidPayment([enrichedBooking], userId);
  return withPayment;
};

const updateAggregateRating = async ({ model, targetId, previousRating, newRating }) => {
  if (!targetId) {
    return;
  }

  const entity = await model.findById(targetId);
  if (!entity) {
    return;
  }

  const currentCount = Number(entity.reviews_count || 0);
  const currentRating = Number(entity.rating || 0);

  let nextCount = currentCount;
  let nextRating = currentRating;

  if (typeof previousRating === 'number') {
    const adjustedTotal = currentRating * currentCount - previousRating + newRating;
    nextRating = currentCount > 0 ? adjustedTotal / currentCount : newRating;
  } else {
    nextCount = currentCount + 1;
    const nextTotal = currentRating * currentCount + newRating;
    nextRating = nextCount > 0 ? nextTotal / nextCount : newRating;
  }

  entity.reviews_count = nextCount;
  entity.rating = Number(nextRating.toFixed(2));
  await entity.save();
};

const rateBookingByUser = async (bookingId, userId, ratingValue) => {
  const booking = await Booking.findOne({ _id: bookingId, user_id: userId }).populate(bookingPopulate);
  if (!booking) {
    return null;
  }

  if (booking.status !== 'CONFIRMED') {
    const error = new Error('Only confirmed bookings can be rated');
    error.statusCode = 400;
    throw error;
  }

  if (!['COACH', 'CADDIE'].includes(booking.booking_type)) {
    const error = new Error('Only coach or caddie bookings can be rated');
    error.statusCode = 400;
    throw error;
  }

  const slotDate = booking.slot ? new Date(booking.slot) : null;
  if (!slotDate || Number.isNaN(slotDate.getTime())) {
    const error = new Error('Booking slot is unavailable for rating');
    error.statusCode = 400;
    throw error;
  }

  if (slotDate.getTime() > Date.now()) {
    const error = new Error('You can rate only after booking time has passed');
    error.statusCode = 400;
    throw error;
  }

  const previousRating = typeof booking.user_rating === 'number' ? booking.user_rating : null;
  booking.user_rating = ratingValue;
  booking.user_rated_at = new Date();
  await booking.save();

  if (booking.booking_type === 'COACH') {
    await updateAggregateRating({
      model: Coach,
      targetId: booking.coach_id?._id || booking.coach_id,
      previousRating,
      newRating: ratingValue,
    });
  }

  if (booking.booking_type === 'CADDIE') {
    await updateAggregateRating({
      model: Caddie,
      targetId: booking.caddie_id?._id || booking.caddie_id,
      previousRating,
      newRating: ratingValue,
    });
  }

  const refreshed = await Booking.findById(booking._id).populate(bookingPopulate);
  const enrichedBooking = enrichBooking(refreshed);
  const [withPayment] = await attachLatestPaidPayment([enrichedBooking], userId);
  return withPayment;
};

const getAllBookings = async (options = {}) => {
  const { limit, actor } = options;
  const filters = {};

  if (actor?.role === 'COURSE_ADMIN') {
    const accessibleCourseIds = await getAccessibleCourseIds(actor);
    filters.course_id = { $in: accessibleCourseIds };
  }

  const query = Booking.find(filters)
    .sort({ created_at: -1 })
    .populate(bookingPopulate);

  if (typeof limit === 'number' && limit > 0) {
    query.limit(limit);
  }

  const bookings = await query;
  return bookings.map(enrichBooking);
};

const getAccessibleCourseIds = async (actor) => {
  if (!actor) {
    return [];
  }

  if (actor.role === 'SUPER_ADMIN') {
    return null;
  }

  if (actor.role !== 'COURSE_ADMIN') {
    return [];
  }

  const courses = await Course.find({ created_by: actor.id }).select('_id').lean();
  return courses.map((course) => String(course._id));
};

const canManageBooking = (booking, actor, accessibleCourseIds) => {
  if (!booking || !actor) {
    return false;
  }

  if (actor.role === 'SUPER_ADMIN') {
    return true;
  }

  if (actor.role !== 'COURSE_ADMIN') {
    return false;
  }

  const bookingCourseId = booking.course_id ? String(booking.course_id) : null;
  if (!bookingCourseId) {
    return false;
  }

  return Array.isArray(accessibleCourseIds) && accessibleCourseIds.includes(bookingCourseId);
};

const updateBookingByAdmin = async (bookingId, payload, actor) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    return null;
  }

  const accessibleCourseIds = await getAccessibleCourseIds(actor);
  if (!canManageBooking(booking, actor, accessibleCourseIds)) {
    const forbidden = new Error('Not authorized to update this booking');
    forbidden.statusCode = 403;
    throw forbidden;
  }

  if (typeof payload.status === 'string') {
    booking.status = payload.status;
  }

  if (typeof payload.admin_notes === 'string') {
    booking.admin_notes = payload.admin_notes.trim();
  }

  if (typeof payload.coach_id === 'string' && booking.booking_type === 'COACH') {
    booking.coach_id = payload.coach_id;
  }

  if (typeof payload.lesson_id === 'string' && booking.booking_type === 'COACH') {
    booking.lesson_id = payload.lesson_id;
  }

  if (typeof payload.caddie_id === 'string' && booking.booking_type === 'CADDIE') {
    booking.caddie_id = payload.caddie_id;
  }

  if (payload.slot) {
    const slotDate = new Date(payload.slot);
    if (Number.isNaN(slotDate.getTime())) {
      const invalid = new Error('Invalid slot date');
      invalid.statusCode = 400;
      throw invalid;
    }
    booking.slot = slotDate;
  }

  await booking.save();
  const refreshed = await Booking.findById(booking._id).populate(bookingPopulate);
  return enrichBooking(refreshed);
};

const cancelBookingByAdmin = async (bookingId, payload, actor) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    return null;
  }

  const accessibleCourseIds = await getAccessibleCourseIds(actor);
  if (!canManageBooking(booking, actor, accessibleCourseIds)) {
    const forbidden = new Error('Not authorized to cancel this booking');
    forbidden.statusCode = 403;
    throw forbidden;
  }

  booking.status = 'CANCELLED';
  if (typeof payload?.admin_notes === 'string') {
    booking.admin_notes = payload.admin_notes.trim();
  }

  await booking.save();
  const refreshed = await Booking.findById(booking._id).populate(bookingPopulate);
  return enrichBooking(refreshed);
};

const deleteBookingByAdmin = async (bookingId, actor) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    return null;
  }

  const accessibleCourseIds = await getAccessibleCourseIds(actor);
  if (!canManageBooking(booking, actor, accessibleCourseIds)) {
    const forbidden = new Error('Not authorized to delete this booking');
    forbidden.statusCode = 403;
    throw forbidden;
  }

  await booking.deleteOne();
  return booking;
};

module.exports = {
  getUserBookings,
  getRecentUserLessons,
  getRecentUserCaddies,
  cancelBookingByUser,
  rateBookingByUser,
  getAllBookings,
  updateBookingByAdmin,
  cancelBookingByAdmin,
  deleteBookingByAdmin,
};
