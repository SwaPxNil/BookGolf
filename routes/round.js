const express = require('express');
const router = express.Router();
const {
  createRound,
  getUserRounds,
  getRound,
} = require('../controllers/roundController');
const { authenticate, authorize } = require('../middlewares/auth');
const validate = require('../middlewares/validator');
const { createRoundSchema } = require('../utils/validators/round.validator');

router.route('/').post(authenticate, authorize('USER'), validate(createRoundSchema), createRound);
router.route('/me').get(authenticate, authorize('USER'), getUserRounds);
router.route('/:id').get(authenticate, authorize('USER'), getRound);

module.exports = router;
