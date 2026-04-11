const roundService = require('../services/roundService');

// @desc    Create a round
// @route   POST /api/rounds
// @access  Private (USER)
const createRound = async (req, res, next) => {
  try {
    const roundData = { ...req.body, user_id: req.user.id };
    const round = await roundService.createRound(roundData);
    res.status(201).json({
      success: true,
      data: round,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get user's rounds
// @route   GET /api/users/me/rounds
// @access  Private (USER)
const getUserRounds = async (req, res, next) => {
    try {
        const rounds = await roundService.getUserRounds(req.user.id);
        res.status(200).json({
            success: true,
            count: rounds.length,
            data: rounds,
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get single round
// @route   GET /api/rounds/:id
// @access  Private (USER)
const getRound = async (req, res, next) => {
    try {
        const round = await roundService.getRoundById(req.params.id);
        if (!round) {
            return res.status(404).json({ success: false, msg: 'Round not found' });
        }
        // Ensure user can only see their own rounds
        if (round.user_id !== req.user.id) {
            return res.status(403).json({ success: false, msg: 'Not authorized to view this round' });
        }
        res.status(200).json({
            success: true,
            data: round,
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Update scorecard for a round
// @route   PATCH /api/rounds/:id/scorecard
// @access  Private (USER)
const updateRoundScorecard = async (req, res, next) => {
  try {
    const round = await roundService.getRoundById(req.params.id);
    if (!round) {
      return res.status(404).json({ success: false, msg: 'Round not found' });
    }

    if (String(round.user_id) !== req.user.id) {
      return res.status(403).json({ success: false, msg: 'Not authorized to update this round' });
    }

    const holeScores = Array.isArray(req.body.hole_scores) ? req.body.hole_scores : [];
    const totalScore = holeScores.reduce((sum, value) => sum + Number(value || 0), 0);

    const updated = await roundService.updateRoundScorecard(req.params.id, {
      hole_scores: holeScores,
      total_score: totalScore,
    });

    res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createRound,
  getUserRounds,
  getRound,
  updateRoundScorecard,
};
