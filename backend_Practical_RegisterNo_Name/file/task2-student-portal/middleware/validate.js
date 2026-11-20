// Runs a Joi schema against req.body.
// Invalid input -> 400 with a list of every problem found.
const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body || {}, {
    abortEarly: false, // report all errors, not just the first
    stripUnknown: true, // drop fields that are not in the schema
  });

  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: error.details.map((d) => d.message.replace(/"/g, '')),
    });
  }

  req.body = value; // cleaned values (trimmed, lowercased email, default role)
  return next();
};

module.exports = validate;
