const handicapService = require('../services/handicapService');

// @desc    Calculate handicap
// @route   POST /api/handicap/calculate
// @access  Private (USER)
const calculateHandicap = async (req, res, next) => {
  try {
    const { recent_score_1, recent_score_2, course_id } = req.body;
    const userId = req.user.id;

    const result = await handicapService.calculateHandicap(
      userId,
      recent_score_1,
      recent_score_2,
      course_id
    );
    
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  calculateHandicap,
};
