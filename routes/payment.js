const express = require('express');
const router = express.Router();
const {
  getUserPayments,
} = require('../controllers/paymentController');
const { authenticate, authorize } = require('../middlewares/auth');

router.route('/me').get(authenticate, authorize('USER'), getUserPayments);

module.exports = router;
