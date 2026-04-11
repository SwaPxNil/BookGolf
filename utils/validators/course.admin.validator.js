const Joi = require('joi');

const updateCourseStatusSchema = Joi.object({
  status: Joi.string().valid('PENDING', 'APPROVED', 'REJECTED').required(),
});

const createCourseAdminSchema = Joi.object({
  full_name: Joi.string().min(3).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const updateCourseAdminStatusSchema = Joi.object({
  status: Joi.string().valid('ACTIVE', 'INACTIVE').required(),
});

module.exports = {
  updateCourseStatusSchema,
  createCourseAdminSchema,
  updateCourseAdminStatusSchema,
};
