const TeeTime = require('../models/TeeTime');
const Course = require('../models/Course');
const Booking = require('../models/Booking');

const createTeeTime = async (teeTimeData) => {
  const teeTime = await TeeTime.create(teeTimeData);
  return teeTime;
};

const getTeeTimesByCourse = async (courseId) => {
  const teeTimes = await TeeTime.find({ course_id: courseId });
  return teeTimes;
};

const getAvailableTeeTimesByCourse = async (courseId) => {
  const teeTimes = await TeeTime.find({ course_id: courseId, status: 'AVAILABLE' });
  return teeTimes;
};

const bookTeeTime = async (userId, teeTimeId) => {
    // Start a session for transaction
    const session = await TeeTime.startSession();
    session.startTransaction();

    try {
        const teeTime = await TeeTime.findById(teeTimeId).session(session);

        if (!teeTime) {
            throw new Error('Tee time not found');
        }

        if (teeTime.status === 'BOOKED') {
            throw new Error('Tee time not available');
        }

        teeTime.status = 'BOOKED';
        await teeTime.save({ session });

        const booking = new Booking({
            user_id: userId,
            booking_type: 'TEE_TIME',
            course_id: teeTime.course_id,
            tee_time_id: teeTimeId,
            status: 'CONFIRMED'
        });

        await booking.save({ session });
        
        await session.commitTransaction();
        session.endSession();

        return booking;
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error; // Re-throw the error to be handled by the controller
    }
};

module.exports = {
  createTeeTime,
  getTeeTimesByCourse,
  getAvailableTeeTimesByCourse,
  bookTeeTime
};
