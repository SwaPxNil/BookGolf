const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const TeeTime = require('../models/TeeTime');
const Coach = require('../models/Coach');
const Caddie = require('../models/Caddie');
const Course = require('../models/Course');
const teeTimeService = require('./teeTimeService');
const coachService = require('./coachService');
const caddieService = require('./caddieService');
const { sendBookingConfirmationEmail } = require('../utils/bookingEmail');

const PAYMENT_METHODS = ['ESEWA', 'KHALTI'];

const roundMoney = (value) => Number(Number(value || 0).toFixed(2));

const getAdvanceAmount = (totalAmount) => roundMoney(Number(totalAmount || 0) / 3);

const resolveTeeTimeDetails = async (teeTimeId) => {
  const normalizedId = String(teeTimeId || '').trim();
  const separatorIndex = normalizedId.indexOf('__');
  const templateId = separatorIndex === -1 ? normalizedId : normalizedId.slice(0, separatorIndex);
  const slotValue = separatorIndex === -1 ? null : decodeURIComponent(normalizedId.slice(separatorIndex + 2));

  const teeTime = await TeeTime.findById(templateId);
  if (!teeTime) {
    throw new Error('Tee time not found');
  }

  const course = await Course.findById(teeTime.course_id);
  const slot = slotValue || teeTime.slot_time;

  return {
    totalAmount: roundMoney(teeTime.price),
    slot,
    serviceName: course?.name || 'Tee time',
  };
};

const resolveCoachBookingDetails = async (coachId, lessonId, slot) => {
  const coach = await Coach.findById(coachId);
  if (!coach) {
    throw new Error('Coach not found');
  }

  const lesson = coach.lessons.id(lessonId);
  if (!lesson) {
    throw new Error('Lesson not found');
  }

  return {
    totalAmount: roundMoney(lesson.price),
    slot,
    serviceName: `${coach.full_name} - ${lesson.title}`,
  };
};

const resolveCaddieBookingDetails = async (caddieId, slot, totalAmount) => {
  const caddie = await Caddie.findById(caddieId);
  if (!caddie) {
    throw new Error('Caddie not found');
  }

  const resolvedAmount = roundMoney(totalAmount);
  if (!resolvedAmount) {
    throw new Error('Caddie price is required');
  }

  return {
    totalAmount: resolvedAmount,
    slot,
    serviceName: caddie.full_name || 'Caddie service',
  };
};

const buildConfirmationDetails = async (payload) => {
  switch (payload.bookingType) {
    case 'TEE_TIME':
      return resolveTeeTimeDetails(payload.teeTimeId);
    case 'COACH':
      return resolveCoachBookingDetails(payload.coachId, payload.lessonId, payload.slot);
    case 'CADDIE':
      return resolveCaddieBookingDetails(payload.caddieId, payload.slot, payload.totalAmount);
    default:
      throw new Error('Unsupported booking type');
  }
};

const createBookingForType = async (userId, payload) => {
  switch (payload.bookingType) {
    case 'TEE_TIME':
      return teeTimeService.bookTeeTime(userId, payload.teeTimeId);
    case 'COACH':
      return coachService.bookCoachLesson(userId, payload.coachId, payload.lessonId, payload.slot);
    case 'CADDIE':
      return caddieService.bookCaddie(userId, payload.caddieId, payload.slot);
    default:
      throw new Error('Unsupported booking type');
  }
};

const processAdvanceBookingPayment = async (user, payload) => {
  const paymentMethod = String(payload?.paymentMethod || '').trim().toUpperCase();
  if (!PAYMENT_METHODS.includes(paymentMethod)) {
    throw new Error('Invalid payment method');
  }

  const bookingType = String(payload?.bookingType || '').trim().toUpperCase();
  const bookingInput = { ...payload, bookingType };
  const details = await buildConfirmationDetails(bookingInput);
  const booking = await createBookingForType(user._id, bookingInput);
  const bookingId = booking?._id || booking?.id;

  if (!bookingId) {
    throw new Error('Booking could not be created');
  }

  const totalAmount = roundMoney(details.totalAmount);
  const advanceAmount = getAdvanceAmount(totalAmount);

  const payment = await Payment.create({
    user_id: user._id,
    booking_id: bookingId,
    booking_type: bookingType,
    payment_method: paymentMethod,
    amount: advanceAmount,
    total_amount: totalAmount,
    status: 'PAID',
  });

  try {
    await sendBookingConfirmationEmail({
      email: user.email,
      fullName: user.full_name,
      bookingType,
      serviceName: details.serviceName,
      slot: details.slot,
      paymentMethod,
      totalAmount,
      advanceAmount,
    });
  } catch (emailError) {
    console.error('Booking confirmation email failed:', emailError.message);
  }

  const populatedBooking = await Booking.findById(bookingId)
    .populate('course_id', 'name location')
    .populate('tee_time_id', 'slot_time price')
    .populate('coach_id', 'full_name')
    .populate('caddie_id', 'full_name');

  return {
    booking: populatedBooking || booking,
    payment,
    totalAmount,
    advanceAmount,
  };
};

module.exports = {
  getAdvanceAmount,
  processAdvanceBookingPayment,
};
