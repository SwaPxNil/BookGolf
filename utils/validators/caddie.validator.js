const Joi = require('joi');

const availabilitySlotSchema = Joi.alternatives().try(
  Joi.date().iso(),
  Joi.string().isoDate(),
  Joi.object({
    dateTime: Joi.string().isoDate().optional(),
    datetime: Joi.string().isoDate().optional(),
    slot: Joi.string().isoDate().optional(),
    value: Joi.string().isoDate().optional(),
    start: Joi.string().isoDate().optional(),
    start_time: Joi.string().isoDate().optional(),
    iso: Joi.string().isoDate().optional(),
  }).unknown(true)
);

const createCaddieSchema = Joi.object({
  full_name: Joi.string().required(),
  description: Joi.string().max(1000).optional(),
  experience: Joi.number().min(0).optional(),
  experience_years: Joi.number().integer().min(0).optional(),
  availability_slots: Joi.array().items(availabilitySlotSchema).optional(),
  availabilitySlots: Joi.array().items(availabilitySlotSchema).optional(),
  profile_img: Joi.string().uri().optional(),
  image_url: Joi.string().uri().optional(),
  rating: Joi.number().min(0).max(5).optional(),
  matches_caddied: Joi.number().integer().min(0).optional(),
  speciality: Joi.string().optional(), // <-- ADDED THIS
  course_id: Joi.string().optional(),
}).or('experience', 'experience_years');

const updateCaddieSchema = Joi.object({
  _id: Joi.string().optional(),
  full_name: Joi.string().optional(),
  description: Joi.string().max(1000).optional(),
  experience: Joi.number().min(0).optional(),
  experience_years: Joi.number().integer().min(0).optional(),
  availability_slots: Joi.array().items(availabilitySlotSchema).optional(),
  availabilitySlots: Joi.array().items(availabilitySlotSchema).optional(),
  profile_img: Joi.string().uri().allow('').optional(),
  image_url: Joi.string().uri().allow('').optional(),
  rating: Joi.number().min(0).max(5).optional(),
  matches_caddied: Joi.number().integer().min(0).optional(),
  speciality: Joi.string().optional(), // <-- ADDED THIS
  course_id: Joi.string().optional(),
  created_by: Joi.string().optional(),
  created_at: Joi.date().optional(),
  __v: Joi.number().optional(),
}).unknown(true);

module.exports = {
  createCaddieSchema,
  updateCaddieSchema,
};