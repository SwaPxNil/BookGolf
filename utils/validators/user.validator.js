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

const dashboardLoginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const verify2FASchema = Joi.object({
    temp_token: Joi.string().required(),
    two_factor_code: Joi.string().length(6).required(),
});

const resend2FASchema = Joi.object({
  temp_token: Joi.string().required(),
});

const refreshTokenSchema = Joi.object({
    refresh_token: Joi.string().required(),
});

const updateProfileSchema = Joi.object({
  full_name: Joi.string().min(3).max(50).optional(),
  email: Joi.string().email().optional(),
  profile_img: Joi.string().allow('').optional(),
  current_password: Joi.string().min(6).optional(),
  new_password: Joi.string().min(6).optional(),
});

const deleteAccountSchema = Joi.object({
  current_password: Joi.string().min(6).required(),
});


module.exports = {
  registerSchema,
  loginSchema,
  dashboardLoginSchema,
  verify2FASchema,
  resend2FASchema,
  refreshTokenSchema,
  updateProfileSchema,
  deleteAccountSchema,
};
