const Joi = require('joi');

const createRoundSchema = Joi.object({
  user_id: Joi.string().required(),
  course_id: Joi.string().required(),
  round_date: Joi.date().iso().required(),
  total_score: Joi.number().integer().min(0).required(),
  hole_scores: Joi.array().items(Joi.number().integer().min(1).max(20)).max(18).optional(),
});

const updateRoundScorecardSchema = Joi.object({
  hole_scores: Joi.array().items(Joi.number().integer().min(1).max(20)).length(18).required(),
});

module.exports = {
  createRoundSchema,
  updateRoundScorecardSchema,
};
