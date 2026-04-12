const Course = require('../models/Course');
const User = require('../models/User');

const CREATED_BY_SELECT = '_id full_name email';

const normalizeCourseAdminAssignment = (courseData = {}) => {
  const normalized = { ...courseData };

  if (Object.prototype.hasOwnProperty.call(normalized, 'course_admin_id')) {
    normalized.created_by = normalized.course_admin_id;
    delete normalized.course_admin_id;
  }

  if (Object.prototype.hasOwnProperty.call(normalized, 'created_by')) {
    if (normalized.created_by === null || normalized.created_by === '') {
      normalized.created_by = null;
    }
  }

  return normalized;
};

const validateAssignedCourseAdmin = async (createdBy) => {
  if (!createdBy) {
    return null;
  }

  const courseAdmin = await User.findById(createdBy);
  if (!courseAdmin || courseAdmin.role !== 'COURSE_ADMIN') {
    const error = new Error('Assigned course admin must be a valid COURSE_ADMIN user');
    error.statusCode = 400;
    throw error;
  }

  return courseAdmin;
};

const createCourse = async (courseData) => {
  const normalizedData = normalizeCourseAdminAssignment(courseData);
  await validateAssignedCourseAdmin(normalizedData.created_by);

  const course = await Course.create(normalizedData);
  return Course.findById(course._id).populate('created_by', CREATED_BY_SELECT);
};

const getCourses = async () => {
  const courses = await Course.find().populate('created_by', CREATED_BY_SELECT);
  return courses;
};

const getCourseById = async (courseId) => {
  const course = await Course.findById(courseId).populate('created_by', CREATED_BY_SELECT);
  return course;
};

const getCoursesByCreator = async (creatorId) => {
  if (!creatorId) {
    return [];
  }

  return Course.find({ created_by: creatorId }).populate('created_by', CREATED_BY_SELECT);
};

const getCourseByCreator = async (creatorId) => {
  if (!creatorId) {
    return null;
  }

  return Course.findOne({ created_by: creatorId }).sort({ created_at: -1 }).populate('created_by', CREATED_BY_SELECT);
};

const getCourseHandicapRatingByName = async (courseName) => {
  const normalizedName = String(courseName || '').trim();
  if (!normalizedName) {
    return null;
  }

  const escapedName = normalizedName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  const course = await Course.findOne({
    name: { $regex: `^${escapedName}$`, $options: 'i' },
  }).select('name course_rating slope_rating');

  return course;
};

const updateCourse = async (courseId, courseData) => {
  const normalizedData = normalizeCourseAdminAssignment(courseData);
  await validateAssignedCourseAdmin(normalizedData.created_by);

  const course = await Course.findByIdAndUpdate(courseId, normalizedData, {
    new: true,
    runValidators: true,
  }).populate('created_by', CREATED_BY_SELECT);
  return course;
};

const deleteCourse = async (courseId) => {
  return Course.findByIdAndDelete(courseId);
};

module.exports = {
  createCourse,
  getCourses,
  getCourseById,
  getCoursesByCreator,
  getCourseByCreator,
  getCourseHandicapRatingByName,
  updateCourse,
  deleteCourse,
};
