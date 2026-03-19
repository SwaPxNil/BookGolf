const express = require('express');
const router = express.Router();
const {
  getAdminLogs,
} = require('../controllers/adminLogController');
const { authenticate, authorize } = require('../middlewares/auth');

router.route('/').get(authenticate, authorize('SUPER_ADMIN'), getAdminLogs);

module.exports = router;
