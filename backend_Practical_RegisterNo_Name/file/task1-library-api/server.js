// Task 1 – Library Book Management API
// Express + MongoDB (Mongoose). Runs on port 3000.
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const express = require('express');
const mongoose = require('mongoose');

const bookRoutes = require('./routes/bookRoutes');
const logger = require('./middleware/logger');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI; // kept in .env

const app = express();

// ---------- Middleware ----------
app.use(logger); // logs method + URL of each request
app.use(express.json()); // parses JSON request bodies

// ---------- Routes ----------
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Library Book Management API is running',
    endpoints: {
      'POST /books': 'Add a book',
      'GET /books': 'List all books',
      'GET /books/:id': 'Get one book',
      'PUT /books/:id': 'Update a book',
      'DELETE /books/:id': 'Delete a book',
    },
  });
});

app.use('/books', bookRoutes);

// ---------- Errors (must be last) ----------
app.use(notFound);
app.use(errorHandler);

// ---------- Start ----------
async function start() {
  if (!MONGO_URI) {
    console.error('MONGO_URI is missing. Copy .env.example to .env inside the file/ folder.');
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    console.log(`MongoDB connected -> database "${mongoose.connection.name}"`);
    app.listen(PORT, () => {
      console.log(`Library API running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error(`Could not connect to MongoDB (${MONGO_URI}): ${err.message}`);
    console.error('Is MongoDB running? Start the MongoDB service or check MONGO_URI in .env');
    process.exit(1);
  }
}

// Start only when run directly (node server.js); A1.js calls start() itself
if (require.main === module) start();

module.exports = { app, start };
