const Booking = require('../models/Booking');
const Round = require('../models/Round');
const bookingService = require('../services/bookingService');

// @desc    Get dashboard data
// @route   GET /api/dashboard
// @access  Private (USER)
exports.getDashboardData = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const isAdmin = req.user.role === 'COURSE_ADMIN' || req.user.role === 'SUPER_ADMIN';

    if (isAdmin) {
      const recentBookings = await bookingService.getAllBookings({ limit: 10 });
      const stats = await Booking.aggregate([
        {
          $group: {
            _id: '$booking_type',
            total: { $sum: 1 },
            confirmed: {
              $sum: {
                $cond: [{ $eq: ['$status', 'CONFIRMED'] }, 1, 0],
              },
            },
            cancelled: {
              $sum: {
                $cond: [{ $eq: ['$status', 'CANCELLED'] }, 1, 0],
              },
            },
          },
        },
      ]);

      const bookingStats = stats.reduce((acc, entry) => {
        acc[entry._id] = {
          total: entry.total,
          confirmed: entry.confirmed,
          cancelled: entry.cancelled,
        };
        return acc;
      }, {});

      return res.status(200).json({
        success: true,
        data: {
          role: req.user.role,
          summary_text: 'Recent booking activity across tee times, coach lessons, and caddie reservations.',
          recentBookings,
          bookingStats,
        },
      });
    }

    // 1. Get recent lessons (last 5)
    const recentLessons = (await bookingService.getUserBookings(userId))
      .filter((booking) => booking.booking_type === 'COACH')
      .slice(0, 5);

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
        role: req.user.role,
        summary_text: 'Your latest lessons and rounds in one place.',
        recentLessons,
        recentCoursesPlayed,
      },
    });
  } catch (err) {
    next(err);
  }
};
