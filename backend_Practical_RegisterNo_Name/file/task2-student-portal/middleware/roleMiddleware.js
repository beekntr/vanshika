// Allows the request only if the logged-in user's role is in the list.
// Usage: authorizeRoles('admin')   -> anyone else gets 403
// Must be used after authMiddleware (which sets req.user).
const authorizeRoles =
  (...allowedRoles) =>
  (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: only ${allowedRoles.join(' / ')} can access this route`,
      });
    }
    return next();
  };

module.exports = authorizeRoles;
