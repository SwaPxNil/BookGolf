const Handicap = require('../models/Handicap');
const Course = require('../models/Course');

const calculateHandicap = async (userId, recentScore1, recentScore2, courseId) => {
  const course = await Course.findById(courseId);
  if (!course) {
    throw new Error('Course not found');
  }

  // Handicap calculation logic (simplified for demonstration)
  // Formula: (Average of recent scores - Course Rating) * 113 / Slope Rating
  const averageScore = (recentScore1 + recentScore2) / 2;
  const handicapValue = ((averageScore - course.course_rating) * 113) / course.slope_rating;

  const newHandicap = await Handicap.create({
    user_id: userId,
    course_id: courseId,
    handicap_value: handicapValue,
  });

  return {
    course_name: course.name,
    handicap_value: newHandicap.handicap_value,
  };
};

module.exports = {
  calculateHandicap,
};
