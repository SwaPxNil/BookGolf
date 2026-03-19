const adminLogService = require('../services/adminLogService');

// @desc    Get all admin logs
// @route   GET /api/admin-logs
// @access  Private (SUPER_ADMIN)
const getAdminLogs = async (req, res, next) => {
  try {
    const adminLogs = await adminLogService.getAdminLogs();
    res.status(200).json({
      success: true,
      count: adminLogs.length,
      data: adminLogs,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAdminLogs,
};
