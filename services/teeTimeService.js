const TeeTime = require('../models/TeeTime');
const Course = require('../models/Course');
const Booking = require('../models/Booking');
const { generateRecurringSlots, slotMatchesTemplate } = require('../utils/recurringAvailability');

const createTeeTime = async (teeTimeData) => {
  const teeTime = await TeeTime.create(teeTimeData);
  return teeTime;
};

const getTeeTimesByCourse = async (courseId) => {
  const teeTimes = await TeeTime.find({ course_id: courseId });
  return teeTimes;
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

const parseBookedTeeTimeId = (rawTeeTimeId) => {
  const normalizedId = String(rawTeeTimeId || '').trim();
  const separatorIndex = normalizedId.indexOf('__');

  if (separatorIndex === -1) {
    return {
      normalizedId,
      templateId: normalizedId,
      slotDate: null,
      isComposite: false,
    };
  }

  const templateId = normalizedId.slice(0, separatorIndex).trim();
  const encodedSlot = normalizedId.slice(separatorIndex + 2).trim();
  const decodedSlot = decodeURIComponent(encodedSlot);
  const slotDate = new Date(decodedSlot);

  return {
    normalizedId,
    templateId,
    slotDate: Number.isNaN(slotDate.getTime()) ? null : slotDate,
    isComposite: true,
  };
};

const bookTeeTime = async (userId, teeTimeId) => {
    const { normalizedId, templateId, slotDate, isComposite } = parseBookedTeeTimeId(teeTimeId);

    if (!normalizedId) {
      throw new Error('Tee time id is required');
    }

    if (!isComposite) {
      const teeTime = await TeeTime.findOneAndUpdate(
        { _id: normalizedId, status: 'AVAILABLE' },
        { status: 'BOOKED' },
        { new: true }
      );

      if (!teeTime) {
          const existingTeeTime = await TeeTime.findById(normalizedId);
          if (!existingTeeTime) {
              throw new Error('Tee time not found');
          }

          throw new Error('Tee time not available');
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
      throw new Error('Tee time not found');
    }

    if (!slotDate) {
      throw new Error('Invalid tee time slot');
    }

    const teeTimeTemplate = await TeeTime.findOne({ _id: templateId });
    if (!teeTimeTemplate) {
      throw new Error('Tee time not found');
    }

    if (teeTimeTemplate.status !== 'AVAILABLE') {
      throw new Error('Tee time not available');
    }

    if (!slotMatchesTemplate(slotDate, [teeTimeTemplate.slot_time])) {
      throw new Error('Tee time not available');
    }

    const existingBooking = await Booking.findOne({
      booking_type: 'TEE_TIME',
      tee_time_id: templateId,
      slot: slotDate,
      status: 'CONFIRMED',
    });

    if (existingBooking) {
      throw new Error('Tee time not available');
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

module.exports = {
  createTeeTime,
  getTeeTimesByCourse,
  getAvailableTeeTimesByCourse,
  bookTeeTime
};
