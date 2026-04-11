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
    const requestedCourseId = req.params.courseId || req.query.courseId;

    if (!requestedCourseId) {
      const filters = {};

      if (req.query.status) {
        filters.status = req.query.status;
      }

      const teeTimes = await teeTimeService.getTeeTimes(filters);
      return res.status(200).json({
        success: true,
        count: teeTimes.length,
        data: teeTimes,
      });
        }

    const course = await courseService.getCourseById(requestedCourseId);
    if(!course) {
      return res.status(404).json({ success: false, msg: 'Course not found' });
    }
        
    const teeTimes = await teeTimeService.getAvailableTeeTimesByCourse(requestedCourseId);
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
        const teeTimeId = req.body?.teeTimeId 
          || req.body?.tee_time_id
          || req.body?.template_id
          || req.body?.templateId
          || req.body?.id
          || req.body?._id;
        const userId = req.user.id;

        if (!teeTimeId) {
            return res.status(400).json({
                success: false,
                msg: 'teeTimeId is required',
            });
        }
        
        const booking = await teeTimeService.bookTeeTime(userId, {
          teeTimeId,
          slot: req.body?.slot || req.body?.slot_time,
        });

        res.status(201).json({
            success: true,
            data: booking,
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Update tee time
// @route   PUT /api/tee-times/:id
// @access  Private (COURSE_ADMIN, SUPER_ADMIN)
const updateTeeTime = async (req, res, next) => {
  try {
    const teeTime = await teeTimeService.updateTeeTime(req.params.id, req.body, req.user);
    if (!teeTime) {
      return res.status(404).json({ success: false, msg: 'Tee time not found' });
    }

    res.status(200).json({
      success: true,
      data: teeTime,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete tee time
// @route   DELETE /api/tee-times/:id
// @access  Private (COURSE_ADMIN, SUPER_ADMIN)
const deleteTeeTime = async (req, res, next) => {
  try {
    const teeTime = await teeTimeService.deleteTeeTime(req.params.id, req.user);
    if (!teeTime) {
      return res.status(404).json({ success: false, msg: 'Tee time not found' });
    }

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get tee times for current course admin courses
// @route   GET /api/course-admin/tee-times
// @access  Private (COURSE_ADMIN, SUPER_ADMIN)
const getCourseAdminTeeTimes = async (req, res, next) => {
  try {
    if (req.user.role === 'SUPER_ADMIN') {
      const filters = {};
      if (req.query.courseId) {
        filters.courseId = req.query.courseId;
      }
      if (req.query.status) {
        filters.status = req.query.status;
      }

      const teeTimes = await teeTimeService.getTeeTimes(filters);
      return res.status(200).json({
        success: true,
        count: teeTimes.length,
        data: teeTimes,
      });
    }

    const courses = await courseService.getCoursesByCreator(req.user.id);
    const courseIds = courses.map((course) => String(course._id));

    if (!courseIds.length) {
      return res.status(200).json({ success: true, count: 0, data: [] });
    }

    const allTeeTimes = await Promise.all(
      courseIds.map((courseId) => teeTimeService.getTeeTimes({
        courseId,
        status: req.query.status,
      }))
    );

    const teeTimes = allTeeTimes.flat();
    res.status(200).json({
      success: true,
      count: teeTimes.length,
      data: teeTimes,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createTeeTime,
  getTeeTimesForCourse,
  bookTeeTime,
  updateTeeTime,
  deleteTeeTime,
  getCourseAdminTeeTimes,
};
