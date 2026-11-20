/**
 * A2.js – Task 2: Student Portal with Login and Protected Routes
 *
 * Run:   node A2.js        (or: npm run task2)
 * URL:   http://localhost:4000
 *
 * Source code is in ./task2-student-portal
 *   server.js                     – helmet, cors, rate limit (100 req / 15 min), routes
 *   models/User.js                – User schema, bcrypt hashing before save
 *   validators/authValidator.js   – Joi rules (email format, password >= 6, role)
 *   middleware/authMiddleware.js  – reads Bearer token, 401 if missing/invalid
 *   middleware/roleMiddleware.js  – authorizeRoles('admin'), 403 for others
 *   routes/authRoutes.js          – POST /register, POST /login (JWT, 1 hour)
 *   routes/userRoutes.js          – GET /profile, GET /students (admin only)
 */
require('./task2-student-portal/server').start();
