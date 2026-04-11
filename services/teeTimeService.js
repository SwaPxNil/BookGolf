const TeeTime = require('../models/TeeTime');
const Course = require('../models/Course');
const Booking = require('../models/Booking');
const mongoose = require('mongoose');
const { generateRecurringSlots, slotMatchesTemplate } = require('../utils/recurringAvailability');

const createTeeTime = async (teeTimeData) => {
  const teeTime = await TeeTime.create(teeTimeData);
  return teeTime;
};

const getTeeTimesByCourse = async (courseId) => {
  const teeTimes = await TeeTime.find({ course_id: courseId });
  return teeTimes;
};

const getTeeTimes = async (filters = {}) => {
  const query = {};

  if (filters.courseId) {
    query.course_id = filters.courseId;
  }

  if (filters.status) {
    query.status = filters.status;
  }

  return TeeTime.find(query).sort({ slot_time: 1 });
};

const getAvailableTeeTimesByCourse = async (courseId) => {
  const teeTimeTemplates = await TeeTime.find({ course_id: courseId, status: 'AVAILABLE' }).lean();
  const templateIds = teeTimeTemplates.map((teeTime) => teeTime._id);

  const confirmedBookings = await Booking.find({
    booking_type: 'TEE_TIME',
    tee_time_id: { $in: templateIds },
    status: 'CONFIRMED',
    slot: { $gte: new Date() },
  }).select('tee_time_id slot');

  const bookedSlotSet = new Set(
    confirmedBookings
      .filter((booking) => booking?.tee_time_id && booking?.slot)
      .map((booking) => `${booking.tee_time_id}__${new Date(booking.slot).toISOString()}`)
  );

  const generatedSlots = teeTimeTemplates.flatMap((template) => {
    const recurringSlots = generateRecurringSlots([template.slot_time]);

    return recurringSlots
      .filter((slot) => !bookedSlotSet.has(`${template._id}__${slot.toISOString()}`))
      .map((slot) => ({
        _id: `${template._id}__${slot.toISOString()}`,
        template_id: template._id,
        course_id: template.course_id,
        slot_time: slot.toISOString(),
        price: template.price,
        status: 'AVAILABLE',
      }));
  });

  return generatedSlots.sort(
    (first, second) => new Date(first.slot_time).getTime() - new Date(second.slot_time).getTime()
  );
};

const safeDecodeURIComponent = (value) => {
  try {
    return decodeURIComponent(value);
  } catch (err) {
    return value;
  }
};

const createBookingError = (message, statusCode) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

const normalizeIncomingId = (value) => {
  const raw = String(value || '').trim();
  if (!raw) {
    return '';
  }

  // Handle frontend values like "<id>", '<id>', or accidental surrounding quotes.
  return raw
    .replace(/^['"`<\s]+/, '')
    .replace(/['"`>\s]+$/, '')
    .trim();
};

const resolveIdFromUnknown = (value) => {
  if (!value) {
    return '';
  }

  if (typeof value === 'string' || typeof value === 'number') {
    return normalizeIncomingId(value);
  }

  if (typeof value === 'object') {
    const nested = value.teeTimeId
      || value.tee_time_id
      || value.template_id
      || value.templateId
      || value.id
      || value._id
      || value.value;

    return nested ? resolveIdFromUnknown(nested) : '';
  }

  return normalizeIncomingId(value);
};

const toObjectIdIfValid = (value) => {
  const normalized = normalizeIncomingId(value);
  if (!normalized || !mongoose.Types.ObjectId.isValid(normalized)) {
    return null;
  }

  return new mongoose.Types.ObjectId(normalized);
};

const findTeeTimeByIdFlexible = async (id) => {
  const normalized = normalizeIncomingId(id);
  if (!normalized) {
    return null;
  }

  const byStringId = await TeeTime.findOne({ _id: normalized }).lean();
  if (byStringId) {
    return byStringId;
  }

  const objectId = toObjectIdIfValid(normalized);
  if (!objectId) {
    return null;
  }

  return TeeTime.collection.findOne({ _id: objectId });
};

const findAvailableAndBookTeeTimeFlexible = async (id) => {
  const normalized = normalizeIncomingId(id);
  if (!normalized) {
    return null;
  }

  const byStringId = await TeeTime.findOneAndUpdate(
    { _id: normalized, status: 'AVAILABLE' },
    { status: 'BOOKED' },
    { new: true }
  );

  if (byStringId) {
    return byStringId;
  }

  const objectId = toObjectIdIfValid(normalized);
  if (!objectId) {
    return null;
  }

  const updated = await TeeTime.collection.findOneAndUpdate(
    { _id: objectId, status: 'AVAILABLE' },
    { $set: { status: 'BOOKED' } },
    { returnDocument: 'after' }
  );

  return updated?.value || null;
};

const parseBookedTeeTimeInput = (rawInput) => {
  let teeTimeId;
  let explicitSlot;

  if (rawInput && typeof rawInput === 'object') {
    teeTimeId = rawInput.teeTimeId
      || rawInput.tee_time_id
      || rawInput.id
      || rawInput._id
      || rawInput.template_id
      || rawInput.templateId;

    explicitSlot = rawInput.slot || rawInput.slot_time;
  } else {
    teeTimeId = rawInput;
  }

  const normalizedId = resolveIdFromUnknown(teeTimeId);
  const decodedId = safeDecodeURIComponent(normalizedId);
  const separatorIndex = decodedId.indexOf('__');

  if (separatorIndex === -1) {
    const explicitSlotDate = explicitSlot ? new Date(explicitSlot) : null;

    if (explicitSlotDate && !Number.isNaN(explicitSlotDate.getTime())) {
      return {
        normalizedId: decodedId,
        templateId: decodedId,
        slotDate: explicitSlotDate,
        isComposite: true,
      };
    }

    return {
      normalizedId: decodedId,
      templateId: decodedId,
      slotDate: null,
      isComposite: false,
    };
  }

  const templateId = decodedId.slice(0, separatorIndex).trim();
  const encodedSlot = decodedId.slice(separatorIndex + 2).trim();
  const decodedSlot = safeDecodeURIComponent(encodedSlot);
  const slotDate = new Date(decodedSlot);

  return {
    normalizedId,
    templateId,
    slotDate: Number.isNaN(slotDate.getTime()) ? null : slotDate,
    isComposite: true,
  };
};

const bookTeeTime = async (userId, teeTimeInput) => {
  const { normalizedId, templateId, slotDate, isComposite } = parseBookedTeeTimeInput(teeTimeInput);

  if (!normalizedId) {
    throw createBookingError('Tee time id is required', 400);
  }

  if (!isComposite) {
    const teeTime = await findAvailableAndBookTeeTimeFlexible(normalizedId);

    if (!teeTime) {
      const existingTeeTime = await findTeeTimeByIdFlexible(normalizedId);
      if (!existingTeeTime) {
        throw createBookingError('Tee time not found', 404);
      }

      const existingBooking = await Booking.findOne({
        booking_type: 'TEE_TIME',
        tee_time_id: normalizedId,
        status: 'CONFIRMED',
      });

      if (existingBooking && String(existingBooking.user_id) === String(userId)) {
        return existingBooking;
      }

      throw createBookingError('Tee time not available', 409);
    }

    const booking = new Booking({
      user_id: userId,
      booking_type: 'TEE_TIME',
      course_id: teeTime.course_id,
      tee_time_id: normalizedId,
      slot: teeTime.slot_time,
      status: 'CONFIRMED'
    });

    await booking.save();
    return booking;
  }

  if (!templateId) {
    throw createBookingError('Tee time not found', 404);
  }

  if (!slotDate) {
    throw createBookingError('Invalid tee time slot', 400);
  }

  const teeTimeTemplate = await findTeeTimeByIdFlexible(templateId);
  if (!teeTimeTemplate) {
    throw createBookingError('Tee time not found', 404);
  }

  if (teeTimeTemplate.status !== 'AVAILABLE') {
    throw createBookingError('Tee time not available', 409);
  }

  if (!slotMatchesTemplate(slotDate, [teeTimeTemplate.slot_time])) {
    throw createBookingError('Tee time not available', 409);
  }

  const existingBooking = await Booking.findOne({
    booking_type: 'TEE_TIME',
    tee_time_id: templateId,
    slot: slotDate,
    status: 'CONFIRMED',
  });

  if (existingBooking) {
    if (String(existingBooking.user_id) === String(userId)) {
      return existingBooking;
    }

    throw createBookingError('Tee time not available', 409);
  }

  const booking = new Booking({
    user_id: userId,
    booking_type: 'TEE_TIME',
    course_id: teeTimeTemplate.course_id,
    tee_time_id: templateId,
    slot: slotDate,
    status: 'CONFIRMED'
  });

  await booking.save();
  return booking;
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

const assertTeeTimeAccess = (teeTime, actor, accessibleCourseIds) => {
  if (!teeTime) {
    return;
  }

  if (actor.role === 'SUPER_ADMIN') {
    return;
  }

  if (actor.role !== 'COURSE_ADMIN') {
    const forbidden = new Error('Not authorized to manage this tee time');
    forbidden.statusCode = 403;
    throw forbidden;
  }

  if (!Array.isArray(accessibleCourseIds) || !accessibleCourseIds.includes(String(teeTime.course_id))) {
    const forbidden = new Error('Not authorized to manage this tee time');
    forbidden.statusCode = 403;
    throw forbidden;
  }
};

const updateTeeTime = async (teeTimeId, payload, actor) => {
  const teeTime = await TeeTime.findById(teeTimeId);
  if (!teeTime) {
    return null;
  }

  const accessibleCourseIds = await getAccessibleCourseIds(actor);
  assertTeeTimeAccess(teeTime, actor, accessibleCourseIds);

  if (payload.slot_time) {
    const slotTime = new Date(payload.slot_time);
    if (Number.isNaN(slotTime.getTime())) {
      const invalid = new Error('Invalid slot_time');
      invalid.statusCode = 400;
      throw invalid;
    }
    teeTime.slot_time = slotTime;
  }

  if (typeof payload.status === 'string') {
    teeTime.status = payload.status;
  }

  if (typeof payload.price !== 'undefined') {
    const allowCourseAdminPriceOverride = String(process.env.ALLOW_COURSE_ADMIN_PRICE_OVERRIDE || 'false').toLowerCase() === 'true';

    if (actor.role === 'SUPER_ADMIN' || allowCourseAdminPriceOverride) {
      const numericPrice = Number(payload.price);
      if (Number.isNaN(numericPrice) || numericPrice < 0) {
        const invalidPrice = new Error('Invalid price');
        invalidPrice.statusCode = 400;
        throw invalidPrice;
      }
      teeTime.price = numericPrice;
    } else {
      const forbiddenPrice = new Error('Price override is not allowed');
      forbiddenPrice.statusCode = 403;
      throw forbiddenPrice;
    }
  }

  await teeTime.save();
  return teeTime;
};

const deleteTeeTime = async (teeTimeId, actor) => {
  const teeTime = await TeeTime.findById(teeTimeId);
  if (!teeTime) {
    return null;
  }

  const accessibleCourseIds = await getAccessibleCourseIds(actor);
  assertTeeTimeAccess(teeTime, actor, accessibleCourseIds);

  await teeTime.deleteOne();
  return teeTime;
};

module.exports = {
  createTeeTime,
  getTeeTimesByCourse,
  getTeeTimes,
  getAvailableTeeTimesByCourse,
  bookTeeTime,
  updateTeeTime,
  deleteTeeTime,
};
