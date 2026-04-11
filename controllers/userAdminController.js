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

// @desc    Create a COURSE_ADMIN user
// @route   POST /api/super-admin/course-admins
// @access  Private (SUPER_ADMIN)
const createCourseAdmin = async (req, res, next) => {
  try {
    const result = await userAdminService.createCourseAdmin(req.body);

    if (result.error) {
      return res.status(result.statusCode || 400).json({ success: false, msg: result.error });
    }

    return res.status(201).json({
      success: true,
      data: result.data,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update COURSE_ADMIN status
// @route   PATCH /api/super-admin/course-admins/:id/status
// @access  Private (SUPER_ADMIN)
const updateCourseAdminStatus = async (req, res, next) => {
  try {
    const result = await userAdminService.updateCourseAdminStatus(req.params.id, req.body.status);

    if (result.error) {
      return res.status(result.statusCode || 400).json({ success: false, msg: result.error });
    }

    return res.status(200).json({
      success: true,
      data: result.data,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getCourseAdmins,
  createCourseAdmin,
  updateCourseAdminStatus,
};
