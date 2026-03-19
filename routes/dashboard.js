const express = require('express');
const router = express.Router();
const { getDashboardData } = require('../controllers/dashboardController');
const { authenticate, authorize } = require('../middlewares/auth');

router.route('/').get(authenticate, authorize('USER', 'COURSE_ADMIN', 'SUPER_ADMIN'), getDashboardData);

module.exports = router;
