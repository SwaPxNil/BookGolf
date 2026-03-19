const Joi = require('joi');

const updateCourseStatusSchema = Joi.object({
  status: Joi.string().valid('PENDING', 'APPROVED', 'REJECTED').required(),
});

module.exports = {
  updateCourseStatusSchema,
};
