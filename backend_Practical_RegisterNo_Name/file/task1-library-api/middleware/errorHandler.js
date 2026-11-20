// 404 for any route that does not exist
const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

// Central error-handling middleware (Express knows it is an error
// handler because it takes 4 arguments).
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let status = err.status || err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors;

  if (err.name === 'ValidationError') {
    // Mongoose schema validation failed (missing title, price < 1, ...)
    status = 400;
    message = 'Validation failed';
    errors = Object.values(err.errors).map((e) => e.message);
  } else if (err.name === 'CastError') {
    // Wrong data type, e.g. price: "abc"
    status = 400;
    message = `Invalid value for "${err.path}": ${JSON.stringify(err.value)}`;
  } else if (err.type === 'entity.parse.failed') {
    // Body is not valid JSON
    status = 400;
    message = 'Request body is not valid JSON';
  }

  if (status >= 500) {
    console.error(err);
    message = 'Internal Server Error';
  }

  res.status(status).json({ success: false, message, ...(errors && { errors }) });
};

module.exports = { notFound, errorHandler };
