const courseService = require('../services/courseService');
const { uploadImageBuffer } = require('../utils/cloudinaryUpload');

// @desc    Create a course
// @route   POST /api/courses
// @access  Private (COURSE_ADMIN)
const createCourse = async (req, res, next) => {
  try {
    const courseData = { ...req.body, created_by: req.user.id };

    if (req.file) {
      const uploadResult = await uploadImageBuffer(req.file, 'courses');
      courseData.image_url = uploadResult.url;
    }

    const course = await courseService.createCourse(courseData);
    res.status(201).json({
      success: true,
      data: course,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
const getCourses = async (req, res, next) => {
  try {
    const courses = await courseService.getCourses();
    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Public
const getCourse = async (req, res, next) => {
  try {
    const course = await courseService.getCourseById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, msg: 'Course not found' });
    }
    res.status(200).json({
      success: true,
      data: course,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get course handicap rating by course name
// @route   GET /api/handicap-rating?name=Royal Nepal Golf Club
// @access  Public
const getHandicapRating = async (req, res, next) => {
  try {
    const { name } = req.query;

    if (!name || !String(name).trim()) {
      return res.status(400).json({
        success: false,
        msg: 'Please provide a course name using the name query parameter',
      });
    }

    const course = await courseService.getCourseHandicapRatingByName(name);

    if (!course) {
      return res.status(404).json({
        success: false,
        msg: 'Course not found',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        name: course.name,
        course_rating: course.course_rating,
        slope_rating: course.slope_rating,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update a course
// @route   PUT /api/courses/:id
// @access  Private (COURSE_ADMIN or SUPER_ADMIN)
const updateCourse = async (req, res, next) => {
  try {
    const courseData = { ...req.body };

    if (req.file) {
      const uploadResult = await uploadImageBuffer(req.file, 'courses');
      courseData.image_url = uploadResult.url;
    }

    const course = await courseService.updateCourse(req.params.id, courseData);
    if (!course) {
      return res.status(404).json({ success: false, msg: 'Course not found' });
    }
    res.status(200).json({
      success: true,
      data: course,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a course
// @route   DELETE /api/courses/:id
// @access  Private (SUPER_ADMIN)
const deleteCourse = async (req, res, next) => {
  try {
    const course = await courseService.deleteCourse(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, msg: 'Course not found' });
    }
    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update course status (for Super Admin to approve/reject)
// @route   PUT /api/super-admin/courses/:id/status
// @access  Private (SUPER_ADMIN)
const updateCourseStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const course = await courseService.updateCourse(req.params.id, { status });
    if (!course) {
      return res.status(404).json({ success: false, msg: 'Course not found' });
    }
    res.status(200).json({
      success: true,
      data: course,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createCourse,
  getCourses,
  getCourse,
  getHandicapRating,
  updateCourse,
  deleteCourse,
  updateCourseStatus,
};
