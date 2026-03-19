const coachService = require('../services/coachService');
const { uploadImageBuffer } = require('../utils/cloudinaryUpload');

// @desc    Create a coach
// @route   POST /api/coaches
// @access  Private (COURSE_ADMIN)
const createCoach = async (req, res, next) => {
  try {
    const coachData = { ...req.body };

    if (req.file) {
      const uploadResult = await uploadImageBuffer(req.file, 'coaches');
      coachData.profile_img = uploadResult.url;
    }

    const coach = await coachService.createCoach(coachData);
    res.status(201).json({
      success: true,
      data: coach,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all coaches
// @route   GET /api/coaches
// @access  Public
const getCoaches = async (req, res, next) => {
  try {
    const coaches = await coachService.getCoaches();
    res.status(200).json({
      success: true,
      count: coaches.length,
      data: coaches,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single coach
// @route   GET /api/coaches/:id
// @access  Public
const getCoach = async (req, res, next) => {
  try {
    const coach = await coachService.getCoachById(req.params.id);
    if (!coach) {
      return res.status(404).json({ success: false, msg: 'Coach not found' });
    }
    res.status(200).json({
      success: true,
      data: coach,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update a coach
// @route   PUT /api/coaches/:id
// @access  Private (COURSE_ADMIN)
const updateCoach = async (req, res, next) => {
  try {
    const coachData = { ...req.body };

    if (req.file) {
      const uploadResult = await uploadImageBuffer(req.file, 'coaches');
      coachData.profile_img = uploadResult.url;
    }

    const coach = await coachService.updateCoach(req.params.id, coachData);
    if (!coach) {
      return res.status(404).json({ success: false, msg: 'Coach not found' });
    }
    res.status(200).json({
      success: true,
      data: coach,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a coach
// @route   DELETE /api/coaches/:id
// @access  Private (COURSE_ADMIN)
const deleteCoach = async (req, res, next) => {
  try {
    const coach = await coachService.deleteCoach(req.params.id);
    if (!coach) {
      return res.status(404).json({ success: false, msg: 'Coach not found' });
    }
    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get lessons for a coach
// @route   GET /api/coaches/:id/lessons
// @access  Public
const getCoachLessons = async (req, res, next) => {
  try {
    const lessons = await coachService.getCoachLessons(req.params.id);
    if (!lessons) {
      return res.status(404).json({ success: false, msg: 'Coach not found' });
    }
    res.status(200).json({
      success: true,
      count: lessons.length,
      data: lessons,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get availability for a coach
// @route   GET /api/coaches/:id/availability
// @access  Public
const getCoachAvailability = async (req, res, next) => {
  try {
    const availability = await coachService.getCoachAvailability(req.params.id);
    if (!availability) {
      return res.status(404).json({ success: false, msg: 'Coach not found' });
    }
    res.status(200).json({
      success: true,
      data: availability,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Book a coach lesson
// @route   POST /api/coach-lessons/book
// @access  Private (USER)
const bookCoachLesson = async (req, res, next) => {
    try {
        const { coachId, lessonId, slot } = req.body;
        const userId = req.user.id;
        
        const booking = await coachService.bookCoachLesson(userId, coachId, lessonId, slot);

        res.status(201).json({
            success: true,
            data: booking,
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Cancel a coach lesson booking
// @route   DELETE /api/coach-lessons/:bookingId
// @access  Private (USER)
const cancelCoachLessonBooking = async (req, res, next) => {
    try {
        const { bookingId } = req.params;
        const userId = req.user.id;
        
        const booking = await coachService.cancelCoachLessonBooking(bookingId, userId);

        res.status(200).json({
            success: true,
            data: booking,
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
  createCoach,
  getCoaches,
  getCoachAvailability,
  getCoach,
  updateCoach,
  deleteCoach,
  getCoachLessons,
  bookCoachLesson,
  cancelCoachLessonBooking,
};
