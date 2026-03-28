const teeTimeService = require('../services/teeTimeService');
const courseService = require('../services/courseService');

// @desc    Create a tee time
// @route   POST /api/tee-times
// @access  Private (COURSE_ADMIN)
const createTeeTime = async (req, res, next) => {
  try {
    const { course_id } = req.body;

    const course = await courseService.getCourseById(course_id);
    if (!course) {
      return res.status(404).json({ success: false, msg: 'Course not found' });
    }

    const teeTime = await teeTimeService.createTeeTime({ ...req.body, price: course.tee_time_price });
    res.status(201).json({
      success: true,
      data: teeTime,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all tee times for a course
// @route   GET /api/courses/:courseId/tee-times
// @access  Public
const getTeeTimesForCourse = async (req, res, next) => {
    try {
        const course = await courseService.getCourseById(req.params.courseId);
        if(!course) {
            return res.status(404).json({ success: false, msg: 'Course not found' });
        }
        
        const teeTimes = await teeTimeService.getAvailableTeeTimesByCourse(req.params.courseId);
        res.status(200).json({
            success: true,
            count: teeTimes.length,
            data: teeTimes,
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Book a tee time
// @route   POST /api/tee-times/book
// @access  Private (USER)
const bookTeeTime = async (req, res, next) => {
    try {
        const teeTimeId = req.body?.teeTimeId || req.body?.tee_time_id;
        const userId = req.user.id;

        if (!teeTimeId) {
            return res.status(400).json({
                success: false,
                msg: 'teeTimeId is required',
            });
        }
        
        const booking = await teeTimeService.bookTeeTime(userId, teeTimeId);

        res.status(201).json({
            success: true,
            data: booking,
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
  createTeeTime,
  getTeeTimesForCourse,
  bookTeeTime
};
