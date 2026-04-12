const Joi = require('joi');

const createCourseSchema = Joi.object({
  name: Joi.string().max(50).required(),
  location: Joi.string().required(),
  slope_rating: Joi.number().required(),
  course_rating: Joi.number().required(),
  tee_time_price: Joi.number().positive().required(),
  image_url: Joi.string().uri().optional(),
  status: Joi.string().valid('PENDING', 'APPROVED', 'REJECTED').optional(),
  created_by: Joi.string().allow('', null).optional(),
  course_admin_id: Joi.string().allow('', null).optional(),
  hole_layouts: Joi.array().items(
    Joi.object({
      hole_number: Joi.number().required(),
      image_url: Joi.string().required(),
    })
  ).optional(),
}).unknown(true);

module.exports = {
  createCourseSchema,
};
