const Coach = require('../models/Coach');
const Booking = require('../models/Booking');
const { generateRecurringSlots, slotMatchesTemplate } = require('../utils/recurringAvailability');

const getConfirmedCoachBookingCount = async (coachId) => {
  const confirmedCount = await Booking.countDocuments({
    booking_type: 'COACH',
    coach_id: coachId,
    status: 'CONFIRMED',
  });

  return confirmedCount;
};

const syncCoachMetrics = async (coach) => {
  if (!coach) {
    return null;
  }

  const confirmedCount = await getConfirmedCoachBookingCount(coach._id);
  coach.students_taught = confirmedCount;
  coach.recommendation_value = Coach.calculateRecommendationValue(coach.rating, confirmedCount);
  await coach.save();

  return coach;
};

const createCoach = async (coachData) => {
  if (coachData.image_url && !coachData.profile_img) {
    coachData.profile_img = coachData.image_url;
  }

  const coach = await Coach.create(coachData);
  return coach;
};

const getCoaches = async () => {
  const coaches = await Coach.find();

  const bookingStats = await Booking.aggregate([
    { $match: { booking_type: 'COACH', status: 'CONFIRMED' } },
    { $group: { _id: '$coach_id', count: { $sum: 1 } } },
  ]);

  const countByCoach = new Map(
    bookingStats.map((entry) => [String(entry._id), entry.count])
  );

  await Promise.all(
    coaches.map(async (coach) => {
      const studentsTaught = countByCoach.get(String(coach._id)) || 0;
      const recommendation = Coach.calculateRecommendationValue(coach.rating, studentsTaught);

      if (
        coach.students_taught !== studentsTaught ||
        coach.recommendation_value !== recommendation
      ) {
        coach.students_taught = studentsTaught;
        coach.recommendation_value = recommendation;
        await coach.save();
      }
    })
  );

  return coaches;
};

const getCoachById = async (coachId) => {
  const coach = await Coach.findById(coachId);
  if (!coach) {
    return null;
  }

  return syncCoachMetrics(coach);
};

const updateCoach = async (coachId, coachData) => {
  if (coachData.image_url && !coachData.profile_img) {
    coachData.profile_img = coachData.image_url;
  }

  if (typeof coachData.rating !== 'undefined' || typeof coachData.students_taught !== 'undefined') {
    const rating = typeof coachData.rating !== 'undefined' ? coachData.rating : 0;
    const studentsTaught = typeof coachData.students_taught !== 'undefined' ? coachData.students_taught : 0;
    coachData.recommendation_value = Coach.calculateRecommendationValue(rating, studentsTaught);
  }

  let coach = await Coach.findByIdAndUpdate(coachId, coachData, {
    new: true,
    runValidators: true,
  });

  if (coach) {
    coach = await syncCoachMetrics(coach);
  }

  return coach;
};

const deleteCoach = async (coachId) => {
  const coach = await Coach.findById(coachId);
  if (coach) {
    await coach.remove();
  }
  return coach;
};

const getCoachLessons = async (coachId) => {
  const coach = await Coach.findById(coachId);
  return coach ? coach.lessons : null;
};

const getCoachAvailability = async (coachId) => {
  const coach = await Coach.findById(coachId);
  if (!coach) {
    return null;
  }

  const allRecurringSlots = generateRecurringSlots(coach.availability_slots);
  const confirmedBookings = await Booking.find({
    booking_type: 'COACH',
    coach_id: coachId,
    status: 'CONFIRMED',
    slot: { $gte: new Date() },
  }).select('slot');

  const bookedSlotSet = new Set(
    confirmedBookings
      .map((booking) => booking?.slot ? new Date(booking.slot).toISOString() : null)
      .filter(Boolean)
  );

  return allRecurringSlots
    .filter((slot) => !bookedSlotSet.has(slot.toISOString()))
    .map((slot) => slot.toISOString());
};

const bookCoachLesson = async (userId, coachId, lessonId, slot) => {
  const coach = await Coach.findById(coachId);
  if (!coach) {
    throw new Error('Coach not found');
  }

  const lesson = coach.lessons.id(lessonId);
  if (!lesson) {
    throw new Error('Lesson not found');
  }

  const slotDate = new Date(slot);
  if (Number.isNaN(slotDate.getTime())) {
    throw new Error('Invalid booking slot');
  }

  if (!slotMatchesTemplate(slotDate, coach.availability_slots)) {
    throw new Error('Coach not available at this slot');
  }

  const existingBooking = await Booking.findOne({
    booking_type: 'COACH',
    coach_id: coachId,
    slot: slotDate,
    status: 'CONFIRMED',
  });

  if (existingBooking) {
    throw new Error('Coach not available at this slot');
  }

  const booking = new Booking({
    user_id: userId,
    booking_type: 'COACH',
    coach_id: coachId,
    lesson_id: lessonId,
    slot: slotDate,
    status: 'CONFIRMED',
  });

  await booking.save();

  const updatedCoach = await Coach.findById(coachId);
  if (updatedCoach) {
    await syncCoachMetrics(updatedCoach);
  }

  return booking;
};

const cancelCoachLessonBooking = async (bookingId, userId) => {
    const booking = await Booking.findOne({ _id: bookingId, user_id: userId });

    if (!booking) {
        throw new Error('Booking not found or user not authorized to cancel');
    }

    if(booking.booking_type !== 'COACH') {
        throw new Error('This booking is not for a coach lesson');
    }

    if (booking.status === 'CANCELLED') {
      return booking;
    }
    
    booking.status = 'CANCELLED';
    await booking.save();

    const updatedCoach = await Coach.findById(booking.coach_id);
    if (updatedCoach) {
      await syncCoachMetrics(updatedCoach);
    }

    return booking;
};


module.exports = {
  createCoach,
  getCoaches,
  getCoachById,
  updateCoach,
  deleteCoach,
  getCoachLessons,
  getCoachAvailability,
  bookCoachLesson,
  cancelCoachLessonBooking,
};
