const Joi = require('joi');

const createCourseSchema = Joi.object({
  name: Joi.string().max(50).required(),
  location: Joi.string().required(),
  slope_rating: Joi.number().required(),
  course_rating: Joi.number().required(),
  tee_time_price: Joi.number().positive().required(),
  image_url: Joi.string().uri().optional(),
  hole_layouts: Joi.array().items(
    Joi.object({
      hole_number: Joi.number().required(),
      image_url: Joi.string().required(),
    })
  ).optional(),
});

module.exports = {
  createCourseSchema,
};
