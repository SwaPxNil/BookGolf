const Joi = require('joi');

const createTeeTimeSchema = Joi.object({
  course_id: Joi.string().required(),
  slot_time: Joi.date().iso().required(),
  status: Joi.string().valid('AVAILABLE', 'BOOKED').optional(),
});

module.exports = {
  createTeeTimeSchema,
};
