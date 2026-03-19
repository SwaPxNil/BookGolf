const userAdminService = require('../services/userAdminService');

// @desc    Get all COURSE_ADMIN users
// @route   GET /api/super-admin/course-admins
// @access  Private (SUPER_ADMIN)
const getCourseAdmins = async (req, res, next) => {
  try {
    const courseAdmins = await userAdminService.getCourseAdmins();
    res.status(200).json({
      success: true,
      count: courseAdmins.length,
      data: courseAdmins,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getCourseAdmins,
};
