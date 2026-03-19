const Course = require('../models/Course');

const createCourse = async (courseData) => {
  const course = await Course.create(courseData);
  return course;
};

const getCourses = async () => {
  const courses = await Course.find();
  return courses;
};

const getCourseById = async (courseId) => {
  const course = await Course.findById(courseId);
  return course;
};

const updateCourse = async (courseId, courseData) => {
  const course = await Course.findByIdAndUpdate(courseId, courseData, {
    new: true,
    runValidators: true,
  });
  return course;
};

const deleteCourse = async (courseId) => {
  const course = await Course.findById(courseId);
  if (course) {
    await course.remove();
  }
  return course;
};

module.exports = {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
};
