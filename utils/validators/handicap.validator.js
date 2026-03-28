const Joi = require('joi');

const calculateHandicapSchema = Joi.object({
  recent_score_1: Joi.number().integer().min(0).required(),
  recent_score_2: Joi.number().integer().min(0).required(),
  course_name: Joi.string().trim().required(),
});

module.exports = {
  calculateHandicapSchema,
};
