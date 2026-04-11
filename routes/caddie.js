const express = require('express');
const router = express.Router();
const {
  createCaddie,
  getCaddies,
  getCaddie,
  updateCaddie,
  deleteCaddie,
  getCaddieAvailability,
  bookCaddie,
  cancelCaddieBooking,
} = require('../controllers/caddieController');
const { authenticate, optionalAuthenticate, authorize } = require('../middlewares/auth');
const { uploadSingleImage, parseJsonFields } = require('../middlewares/upload');
const validate = require('../middlewares/validator');
const { createCaddieSchema, updateCaddieSchema } = require('../utils/validators/caddie.validator');

router
  .route('/')
  .get(optionalAuthenticate, getCaddies)
  .post(
    authenticate,
    authorize('COURSE_ADMIN'),
    uploadSingleImage('image'),
    parseJsonFields(['availability_slots', 'availabilitySlots']),
    validate(createCaddieSchema),
    createCaddie
  );

router
  .route('/:id')
  .get(getCaddie)
  .put(
    authenticate,
    authorize('COURSE_ADMIN', 'SUPER_ADMIN'),
    uploadSingleImage('image'),
    parseJsonFields(['availability_slots', 'availabilitySlots']),
    validate(updateCaddieSchema),
    updateCaddie
  )
  .delete(authenticate, authorize('COURSE_ADMIN', 'SUPER_ADMIN'), deleteCaddie);

router.route('/:id/availability').get(getCaddieAvailability);

const caddieBookingRouter = express.Router();
caddieBookingRouter.post('/book', authenticate, authorize('USER'), bookCaddie);
caddieBookingRouter.delete('/book/:bookingId', authenticate, authorize('USER'), cancelCaddieBooking);

module.exports = { caddieRouter: router, caddieBookingRouter };
