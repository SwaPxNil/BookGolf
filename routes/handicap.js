const express = require('express');
const router = express.Router();
const {
  calculateHandicap,
} = require('../controllers/handicapController');
const { authenticate, authorize } = require('../middlewares/auth');
const validate = require('../middlewares/validator');
const { calculateHandicapSchema } = require('../utils/validators/handicap.validator');

router.route('/calculate').post(authenticate, authorize('USER'), validate(calculateHandicapSchema), calculateHandicap);

module.exports = router;
