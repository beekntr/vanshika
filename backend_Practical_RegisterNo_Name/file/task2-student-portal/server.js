// Task 2 – Student Portal with Login and Protected Routes
// Express + MongoDB + JWT. Runs on port 4000 (PORTAL_PORT in .env).
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cors = require('cors');
const { rateLimit } = require('express-rate-limit');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const logger = require('./middleware/logger');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const PORT = process.env.PORTAL_PORT || 4000;
const MONGO_URI = process.env.PORTAL_MONGO_URI;

const app = express();

app.use(logger);

// ---------- Basic security ----------
app.use(helmet()); // secure HTTP headers
app.use(cors()); // allow cross-origin requests
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // max 100 requests per IP per window
    standardHeaders: 'draft-7', // send RateLimit-* headers
    legacyHeaders: false,
    message: {
      success: false,
      message: 'Too many requests from this IP. Try again after 15 minutes',
    },
  })
);

app.use(express.json({ limit: '10kb' })); // small body limit

// ---------- Routes ----------
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Student Portal API is running',
    endpoints: {
      'POST /register': 'Register (name, email, password, role)',
      'POST /login': 'Login -> JWT valid for 1 hour',
      'GET /profile': 'Logged-in user profile (Bearer token)',
      'GET /students': 'All students (admin only)',
    },
  });
});

app.use(authRoutes); // /register, /login
app.use(userRoutes); // /profile, /students

// ---------- Errors (must be last) ----------
app.use(notFound);
app.use(errorHandler);

// ---------- Start ----------
async function start() {
  if (!MONGO_URI || !process.env.JWT_SECRET) {
    console.error('PORTAL_MONGO_URI or JWT_SECRET is missing. Copy .env.example to .env inside the file/ folder.');
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    console.log(`MongoDB connected -> database "${mongoose.connection.name}"`);
    app.listen(PORT, () => {
      console.log(`Student Portal running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error(`Could not connect to MongoDB (${MONGO_URI}): ${err.message}`);
    console.error('Is MongoDB running? Start the MongoDB service or check PORTAL_MONGO_URI in .env');
    process.exit(1);
  }
}

if (require.main === module) start();

module.exports = { app, start };
