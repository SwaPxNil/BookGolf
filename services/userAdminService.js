const User = require('../models/User');
const { hashPassword } = require('../utils/auth');

const toCourseAdminResponse = (userDoc) => {
  if (!userDoc) {
    return null;
  }

  return {
    _id: userDoc._id,
    full_name: userDoc.full_name,
    email: userDoc.email,
    role: userDoc.role,
    status: userDoc.status || 'ACTIVE',
    profile_img: userDoc.profile_img,
  };
};

const getCourseAdmins = async () => {
    const courseAdmins = await User.find({ role: 'COURSE_ADMIN' }).sort({ created_at: -1 });
    return courseAdmins.map(toCourseAdminResponse);
};

const createCourseAdmin = async ({ full_name, email, password }) => {
  const normalizedEmail = String(email || '').trim().toLowerCase();

  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    return { error: 'User already exists', statusCode: 400 };
  }

  const password_hash = await hashPassword(password);

  const courseAdmin = await User.create({
    full_name: String(full_name || '').trim(),
    email: normalizedEmail,
    password_hash,
    role: 'COURSE_ADMIN',
    status: 'ACTIVE',
  });

  return { data: toCourseAdminResponse(courseAdmin) };
};

const updateCourseAdminStatus = async (id, status) => {
  const courseAdmin = await User.findOne({ _id: id, role: 'COURSE_ADMIN' });
  if (!courseAdmin) {
    return { error: 'Course admin not found', statusCode: 404 };
  }

  courseAdmin.status = status;
  await courseAdmin.save();

  return { data: toCourseAdminResponse(courseAdmin) };
};

module.exports = {
  getCourseAdmins,
  createCourseAdmin,
  updateCourseAdminStatus,
};
