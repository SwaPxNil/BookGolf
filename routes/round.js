const express = require('express');
const router = express.Router();
const {
  createRound,
  getUserRounds,
  getRound,
  updateRoundScorecard,
} = require('../controllers/roundController');
const { authenticate, authorize } = require('../middlewares/auth');
const validate = require('../middlewares/validator');
const { createRoundSchema, updateRoundScorecardSchema } = require('../utils/validators/round.validator');

router.route('/').post(authenticate, authorize('USER'), validate(createRoundSchema), createRound);
router.route('/me').get(authenticate, authorize('USER'), getUserRounds);
router.route('/:id').get(authenticate, authorize('USER'), getRound);
router.route('/:id/scorecard').patch(authenticate, authorize('USER'), validate(updateRoundScorecardSchema), updateRoundScorecard);

module.exports = router;
