const express = require('express');
const router = express.Router({ mergeParams: true });
const {
  createTeeTime,
  getTeeTimesForCourse,
  bookTeeTime,
  updateTeeTime,
  deleteTeeTime,
  getCourseAdminTeeTimes,
} = require('../controllers/teeTimeController');
const { authenticate, authorize } = require('../middlewares/auth');
const validate = require('../middlewares/validator');
const { createTeeTimeSchema } = require('../utils/validators/teeTime.validator');


router
    .route('/')
    .get(getTeeTimesForCourse)
    .post(authenticate, authorize('COURSE_ADMIN'), validate(createTeeTimeSchema), createTeeTime);

router
    .route('/book')
    .post(authenticate, authorize('USER'), bookTeeTime);

router
  .route('/course-admin')
  .get(authenticate, authorize('COURSE_ADMIN', 'SUPER_ADMIN'), getCourseAdminTeeTimes);

router
  .route('/:id')
  .put(authenticate, authorize('COURSE_ADMIN', 'SUPER_ADMIN'), updateTeeTime)
  .delete(authenticate, authorize('COURSE_ADMIN', 'SUPER_ADMIN'), deleteTeeTime);


module.exports = router;
