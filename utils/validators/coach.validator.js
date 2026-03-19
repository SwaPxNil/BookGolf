const Joi = require('joi');

const createCoachSchema = Joi.object({
  full_name: Joi.string().required(),
  specialization: Joi.string().required(),
  description: Joi.string().max(1000).optional(),
  experience_years: Joi.number().integer().min(0).required(),
  availability_slots: Joi.array().items(Joi.date().iso()).optional(),
  profile_img: Joi.string().uri().optional(),
  image_url: Joi.string().uri().optional(),
  rating: Joi.number().min(0).max(5).optional(),
  reviews_count: Joi.number().integer().min(0).optional(),
  students_taught: Joi.number().integer().min(0).optional(),
  recommendation_value: Joi.number().min(0).optional(),
  lessons: Joi.array().items(
    Joi.object({
      title: Joi.string().required(),
      duration_minutes: Joi.number().integer().positive().required(),
      price: Joi.number().positive().required(),
    })
  ).optional(),
});

const updateCoachSchema = Joi.object({
  full_name: Joi.string().optional(),
  specialization: Joi.string().optional(),
  description: Joi.string().max(1000).optional(),
  experience_years: Joi.number().integer().min(0).optional(),
  availability_slots: Joi.array().items(Joi.date().iso()).optional(),
  profile_img: Joi.string().uri().optional(),
  image_url: Joi.string().uri().optional(),
  rating: Joi.number().min(0).max(5).optional(),
  reviews_count: Joi.number().integer().min(0).optional(),
  lessons: Joi.array().items(
    Joi.object({
      title: Joi.string().required(),
      duration_minutes: Joi.number().integer().positive().required(),
      price: Joi.number().positive().required(),
    })
  ).optional(),
});

module.exports = {
  createCoachSchema,
  updateCoachSchema,
};
