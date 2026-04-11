const express = require('express');
const router = express.Router();
const {
  getCourseAdmins,
  createCourseAdmin,
  updateCourseAdminStatus,
} = require('../controllers/userAdminController');
const { getAdminLogs } = require('../controllers/adminLogController');
const { updateCourseStatus } = require('../controllers/courseController');
const { authenticate, authorize } = require('../middlewares/auth');
const validate = require('../middlewares/validator');
const {
  updateCourseStatusSchema,
  createCourseAdminSchema,
  updateCourseAdminStatusSchema,
} = require('../utils/validators/course.admin.validator');

router
  .route('/course-admins')
  .get(authenticate, authorize('SUPER_ADMIN'), getCourseAdmins)
  .post(authenticate, authorize('SUPER_ADMIN'), validate(createCourseAdminSchema), createCourseAdmin);
router.route('/logs').get(authenticate, authorize('SUPER_ADMIN'), getAdminLogs);
router.route('/courses/:id/status').put(authenticate, authorize('SUPER_ADMIN'), validate(updateCourseStatusSchema), updateCourseStatus);
router
  .route('/course-admins/:id/status')
  .patch(authenticate, authorize('SUPER_ADMIN'), validate(updateCourseAdminStatusSchema), updateCourseAdminStatus);

router.route('/course-admins/:id/activate').patch(
  authenticate,
  authorize('SUPER_ADMIN'),
  (req, res, next) => {
    req.body.status = 'ACTIVE';
    next();
  },
  validate(updateCourseAdminStatusSchema),
  updateCourseAdminStatus
);

router.route('/course-admins/:id/deactivate').patch(
  authenticate,
  authorize('SUPER_ADMIN'),
  (req, res, next) => {
    req.body.status = 'INACTIVE';
    next();
  },
  validate(updateCourseAdminStatusSchema),
  updateCourseAdminStatus
);

module.exports = router;
