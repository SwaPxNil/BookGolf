const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middlewares/auth');
const { getCourseAdminTeeTimes } = require('../controllers/teeTimeController');

router
  .route('/tee-times')
  .get(authenticate, authorize('COURSE_ADMIN', 'SUPER_ADMIN'), getCourseAdminTeeTimes);

module.exports = router;
