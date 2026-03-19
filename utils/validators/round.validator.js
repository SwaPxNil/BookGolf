const Joi = require('joi');

const createRoundSchema = Joi.object({
  user_id: Joi.string().required(),
  course_id: Joi.string().required(),
  round_date: Joi.date().iso().required(),
  total_score: Joi.number().integer().min(0).required(),
});

module.exports = {
  createRoundSchema,
};
