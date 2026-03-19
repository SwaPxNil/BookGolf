const express = require('express');
const router = express.Router();
const {
  getCourseAdmins,
} = require('../controllers/userAdminController');
const { getAdminLogs } = require('../controllers/adminLogController');
const { updateCourseStatus } = require('../controllers/courseController');
const { authenticate, authorize } = require('../middlewares/auth');
const validate = require('../middlewares/validator');
const { updateCourseStatusSchema } = require('../utils/validators/course.admin.validator');

router.route('/course-admins').get(authenticate, authorize('SUPER_ADMIN'), getCourseAdmins);
router.route('/logs').get(authenticate, authorize('SUPER_ADMIN'), getAdminLogs);
router.route('/courses/:id/status').put(authenticate, authorize('SUPER_ADMIN'), validate(updateCourseStatusSchema), updateCourseStatus);

module.exports = router;
