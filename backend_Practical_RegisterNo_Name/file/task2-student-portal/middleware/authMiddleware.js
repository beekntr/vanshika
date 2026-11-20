const jwt = require('jsonwebtoken');

// Reads the JWT from the Authorization header:  Authorization: Bearer <token>
// Missing or invalid token -> 401
const authMiddleware = (req, res, next) => {
  const header = req.headers.authorization || '';
  const match = header.match(/^Bearer\s+(\S+)$/i);

  if (!match) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided',
    });
  }

  let decoded;
  try {
    decoded = jwt.verify(match[1], process.env.JWT_SECRET);
  } catch (err) {
    return res.status(401).json({
      success: false,
      message:
        err.name === 'TokenExpiredError'
          ? 'Token has expired. Please log in again'
          : 'Invalid token',
    });
  }

  req.user = { id: decoded.id, role: decoded.role };
  return next();
};

module.exports = authMiddleware;
