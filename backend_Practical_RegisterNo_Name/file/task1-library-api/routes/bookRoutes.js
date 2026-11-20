const express = require('express');
const validateObjectId = require('../middleware/validateObjectId');
const {
  createBook,
  getBooks,
  getBookById,
  updateBook,
  deleteBook,
} = require('../controllers/bookController');

const router = express.Router();

// Mounted at /books in server.js
router.post('/', createBook); // POST   /books
router.get('/', getBooks); // GET    /books
router.get('/:id', validateObjectId, getBookById); // GET    /books/:id
router.put('/:id', validateObjectId, updateBook); // PUT    /books/:id
router.delete('/:id', validateObjectId, deleteBook); // DELETE /books/:id

module.exports = router;
