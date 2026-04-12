const express = require('express');
const router = express.Router();
const {
  createCoach,
  getCoaches,
  getCoach,
  updateCoach,
  deleteCoach,
  getCoachLessons,
  getCoachAvailability,
  bookCoachLesson,
  cancelCoachLessonBooking,
} = require('../controllers/coachController');
const { authenticate, optionalAuthenticate, authorize } = require('../middlewares/auth');
const { uploadSingleImage, parseJsonFields } = require('../middlewares/upload');
const validate = require('../middlewares/validator');
const { createCoachSchema, updateCoachSchema } = require('../utils/validators/coach.validator');

router
  .route('/')
  .get(optionalAuthenticate, getCoaches)
  .post(
    authenticate,
    authorize('COURSE_ADMIN', 'SUPER_ADMIN'),
    uploadSingleImage('image'),
    parseJsonFields(['availability_slots', 'availabilitySlots', 'lessons']),
    validate(createCoachSchema),
    createCoach
  );

router
  .route('/:id')
  .get(getCoach)
  .put(
    authenticate,
    authorize('COURSE_ADMIN', 'SUPER_ADMIN'),
    uploadSingleImage('image'),
    parseJsonFields(['availability_slots', 'availabilitySlots', 'lessons']),
    validate(updateCoachSchema),
    updateCoach
  )
  .delete(authenticate, authorize('COURSE_ADMIN', 'SUPER_ADMIN'), deleteCoach);

router.route('/:id/lessons').get(getCoachLessons);
router.route('/:id/availability').get(getCoachAvailability);

const coachLessonRouter = express.Router();
coachLessonRouter.post('/book', authenticate, authorize('USER'), bookCoachLesson);
coachLessonRouter.delete('/:bookingId', authenticate, authorize('USER'), cancelCoachLessonBooking);

module.exports = { coachRouter: router, coachLessonRouter };
