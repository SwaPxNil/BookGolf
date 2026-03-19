const Joi = require('joi');

const registerSchema = Joi.object({
  full_name: Joi.string().min(3).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('USER', 'COURSE_ADMIN', 'SUPER_ADMIN').optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const verify2FASchema = Joi.object({
    temp_token: Joi.string().required(),
    two_factor_code: Joi.string().length(6).required(),
});

const refreshTokenSchema = Joi.object({
    refresh_token: Joi.string().required(),
});


module.exports = {
  registerSchema,
  loginSchema,
  verify2FASchema,
  refreshTokenSchema
};
