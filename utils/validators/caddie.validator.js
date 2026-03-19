const Joi = require('joi');

const createCaddieSchema = Joi.object({
  full_name: Joi.string().required(),
  description: Joi.string().max(1000).optional(),
  experience: Joi.number().min(0).optional(),
  experience_years: Joi.number().integer().min(0).optional(),
  availability_slots: Joi.array().items(Joi.date().iso()).optional(),
  profile_img: Joi.string().uri().optional(),
  image_url: Joi.string().uri().optional(),
  rating: Joi.number().min(0).max(5).optional(),
  matches_caddied: Joi.number().integer().min(0).optional(),
}).or('experience', 'experience_years');

const updateCaddieSchema = Joi.object({
  full_name: Joi.string().optional(),
  description: Joi.string().max(1000).optional(),
  experience: Joi.number().min(0).optional(),
  experience_years: Joi.number().integer().min(0).optional(),
  availability_slots: Joi.array().items(Joi.date().iso()).optional(),
  profile_img: Joi.string().uri().optional(),
  image_url: Joi.string().uri().optional(),
  rating: Joi.number().min(0).max(5).optional(),
  matches_caddied: Joi.number().integer().min(0).optional(),
});

module.exports = {
  createCaddieSchema,
  updateCaddieSchema,
};
