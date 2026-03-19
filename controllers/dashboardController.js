const Booking = require('../models/Booking');
const Round = require('../models/Round');
const Course = require('../models/Course');

// @desc    Get dashboard data
// @route   GET /api/dashboard
// @access  Private (USER)
exports.getDashboardData = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // 1. Get recent lessons (last 5)
    const recentLessons = await Booking.find({ user_id: userId, booking_type: 'COACH' })
      .sort({ created_at: -1 })
      .limit(5)
      .populate({
        path: 'coach_id',
        select: 'full_name specialization lessons',
      })
      .select('coach_id lesson_id slot created_at');

    // 2. Get recent courses played (last 5 rounds)
    const recentRounds = await Round.find({ user_id: userId })
      .sort({ created_at: -1 })
      .limit(5)
      .populate({
        path: 'course_id',
        select: 'name location hole_layouts', // Select relevant course fields
      })
      .select('course_id round_date total_score');

    const recentCoursesPlayed = recentRounds.map(round => ({
      course: round.course_id, // This will contain the populated course object
      round_date: round.round_date,
      total_score: round.total_score,
    }));

    res.status(200).json({
      success: true,
      data: {
        recentLessons,
        recentCoursesPlayed,
      },
    });
  } catch (err) {
    next(err);
  }
};
