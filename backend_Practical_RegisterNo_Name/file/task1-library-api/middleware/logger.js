// Logger middleware – prints the method and URL of every request,
// plus the status code and time taken once the response is sent.
// Example:  [2026-11-20T15:30:12.345Z] POST /books -> 201 (12 ms)
const logger = (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - start;
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${ms} ms)`
    );
  });
  next();
};

module.exports = logger;
