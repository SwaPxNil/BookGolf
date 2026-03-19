const User = require('../models/User');

const getCourseAdmins = async () => {
    const courseAdmins = await User.find({ role: 'COURSE_ADMIN' });
    return courseAdmins;
};

module.exports = {
  getCourseAdmins,
};
