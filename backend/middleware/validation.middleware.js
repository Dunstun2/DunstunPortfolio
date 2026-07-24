const Joi = require('joi');

/**
 * Validation middleware factory
 * @param {Object} schema - Joi schema object with optional body, query, params keys
 * @returns {Function} Express middleware function
 */
const validate = (schema) => {
  return (req, res, next) => {
    const toValidate = {};
    
    if (schema.body) toValidate.body = req.body;
    if (schema.query) toValidate.query = req.query;
    if (schema.params) toValidate.params = req.params;

    const validationSchema = Joi.object(schema);
    const { error, value } = validationSchema.validate(toValidate, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors,
      });
    }

    // Replace req values with validated and sanitized values
    if (schema.body) req.body = value.body;
    if (schema.query) req.query = value.query;
    if (schema.params) req.params = value.params;

    next();
  };
};

module.exports = { validate };
