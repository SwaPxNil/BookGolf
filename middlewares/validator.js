const Joi = require('joi');

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);

  if (error) {
    res.status(400).json({
      success: false,
      error: error.details[0].message,
    });
  } else {
    next();
  }
};

module.exports = validate;
