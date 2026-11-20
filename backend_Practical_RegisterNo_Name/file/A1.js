/**
 * A1.js – Task 1: Library Book Management API
 *
 * Run:   node A1.js        (or: npm run task1)
 * URL:   http://localhost:3000
 *
 * Source code is in ./task1-library-api
 *   server.js                  – Express app, MongoDB connection, port 3000
 *   models/Book.js             – Book schema (title, author, price, category, isAvailable)
 *   routes/bookRoutes.js       – POST/GET/GET:id/PUT/DELETE /books
 *   controllers/bookController – route logic + 201/200/400/404 responses
 *   middleware/logger.js       – prints method + URL of every request
 *   middleware/errorHandler.js – 404 for unknown routes + error-handling middleware
 */
require('./task1-library-api/server').start();
