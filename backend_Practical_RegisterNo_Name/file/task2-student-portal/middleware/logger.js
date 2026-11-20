// Prints method, URL, status code and time for every request
// Example:  [2026-11-20T15:30:12.345Z] GET /profile -> 200 (4 ms)
const logger = (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${Date.now() - start} ms)`
    );
  });
  next();
};

module.exports = logger;
