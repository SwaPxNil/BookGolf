const Joi = require('joi');

const lessonSchema = Joi.object({
  _id: Joi.string().allow('', null).optional(),
  title: Joi.string().trim().required(),
  duration_minutes: Joi.number().integer().positive().optional(),
  durationMinutes: Joi.number().integer().positive().optional(),
  price: Joi.number().positive().required(),
})
  .or('duration_minutes', 'durationMinutes')
  .unknown(true);

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

const createCoachSchema = Joi.object({
  full_name: Joi.string().required(),
  specialization: Joi.string().required(),
  description: Joi.string().max(1000).optional(),
  experience_years: Joi.number().integer().min(0).required(),
  availability_slots: Joi.array().items(availabilitySlotSchema).optional(),
  availabilitySlots: Joi.array().items(availabilitySlotSchema).optional(),
  profile_img: Joi.string().uri().optional(),
  image_url: Joi.string().uri().optional(),
  rating: Joi.number().min(0).max(5).optional(),
  reviews_count: Joi.number().integer().min(0).optional(),
  students_taught: Joi.number().integer().min(0).optional(),
  recommendation_value: Joi.number().min(0).optional(),
  lessons: Joi.array().items(lessonSchema).optional(),
  course_id: Joi.string().optional(),
});

const updateCoachSchema = Joi.object({
  _id: Joi.string().optional(),
  full_name: Joi.string().allow('', null).optional(),
  specialization: Joi.string().allow('', null).optional(),
  description: Joi.string().max(1000).allow('', null).optional(),
  experience_years: Joi.number().integer().min(0).allow('', null).optional(),
  availability_slots: Joi.array().items(availabilitySlotSchema).allow(null).optional(),
  availabilitySlots: Joi.array().items(availabilitySlotSchema).allow(null).optional(),
  profile_img: Joi.string().uri().allow('').optional(),
  image_url: Joi.string().uri().allow('').optional(),
  rating: Joi.number().min(0).max(5).allow('', null).optional(),
  reviews_count: Joi.number().integer().min(0).allow('', null).optional(),
  lessons: Joi.array().items(
    Joi.object({
      _id: Joi.string().allow('', null).optional(),
      title: Joi.string().allow('', null).optional(),
      duration_minutes: Joi.number().integer().positive().allow('', null).optional(),
      durationMinutes: Joi.number().integer().positive().allow('', null).optional(),
      price: Joi.number().positive().allow('', null).optional(),
    }).unknown(true)
  ).allow(null).optional(),
  course_id: Joi.string().allow('', null).optional(),
  created_by: Joi.string().allow('', null).optional(),
  created_at: Joi.date().allow(null).optional(),
  __v: Joi.number().optional(),
}).unknown(true);

module.exports = {
  createCoachSchema,
  updateCoachSchema,
};
