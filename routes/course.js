const express = require('express');
const router = express.Router();
const {
  createCourse,
  getCourses,
  getCourse,
  getMyCourse,
  updateCourse,
  deleteCourse,
} = require('../controllers/courseController');
const { authenticate, authorize } = require('../middlewares/auth');
const { uploadSingleImage, parseJsonFields } = require('../middlewares/upload');
const validate = require('../middlewares/validator');
const { createCourseSchema } = require('../utils/validators/course.validator');

// Re-route into other resource routers
const teeTimeRouter = require('./teeTime');
router.use('/:courseId/tee-times', teeTimeRouter);

router
  .route('/')
  .get(getCourses)
  .post(
    authenticate,
    authorize('COURSE_ADMIN', 'SUPER_ADMIN'),
    uploadSingleImage('image'),
    parseJsonFields(['hole_layouts']),
    validate(createCourseSchema),
    createCourse
  );

router
  .route('/me')
  .get(authenticate, authorize('COURSE_ADMIN', 'SUPER_ADMIN'), getMyCourse);

router
  .route('/:id')
  .get(getCourse)
  .put(
    authenticate,
    authorize('COURSE_ADMIN', 'SUPER_ADMIN'),
    uploadSingleImage('image'),
    parseJsonFields(['hole_layouts']),
    updateCourse
  )
  .delete(authenticate, authorize('SUPER_ADMIN'), deleteCourse);

module.exports = router;
