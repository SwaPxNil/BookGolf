const express = require('express');
const router = express.Router({ mergeParams: true });
const {
  createTeeTime,
  getTeeTimesForCourse,
  bookTeeTime
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


module.exports = router;
