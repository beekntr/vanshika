const Book = require('../models/Book');

// Only these fields can be set from the request body
// (stops clients from sending _id, createdAt, etc.)
const ALLOWED_FIELDS = ['title', 'author', 'price', 'category', 'isAvailable'];

const pickBookFields = (body = {}) => {
  const data = {};
  ALLOWED_FIELDS.forEach((field) => {
    if (body[field] !== undefined) data[field] = body[field];
  });
  return data;
};

// POST /books  -> add a book
const createBook = async (req, res, next) => {
  try {
    const book = await Book.create(pickBookFields(req.body));
    return res.status(201).json({
      success: true,
      message: 'Book added successfully',
      data: book,
    });
  } catch (err) {
    return next(err); // ValidationError -> 400 in errorHandler
  }
};

// GET /books  -> list all books
const getBooks = async (req, res, next) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      count: books.length,
      data: books,
    });
  } catch (err) {
    return next(err);
  }
};

// GET /books/:id  -> one book
const getBookById = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }
    return res.status(200).json({ success: true, data: book });
  } catch (err) {
    return next(err);
  }
};

// PUT /books/:id  -> update a book
const updateBook = async (req, res, next) => {
  try {
    const updates = pickBookFields(req.body);
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: `Nothing to update. Send at least one of: ${ALLOWED_FIELDS.join(', ')}`,
      });
    }

    const book = await Book.findByIdAndUpdate(req.params.id, updates, {
      new: true, // return the updated document
      runValidators: true, // apply schema rules (required, min) on update too
    });

    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }
    return res.status(200).json({
      success: true,
      message: 'Book updated successfully',
      data: book,
    });
  } catch (err) {
    return next(err);
  }
};

// DELETE /books/:id  -> delete a book
const deleteBook = async (req, res, next) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }
    return res.status(200).json({
      success: true,
      message: 'Book deleted successfully',
      data: book,
    });
  } catch (err) {
    return next(err);
  }
};

module.exports = { createBook, getBooks, getBookById, updateBook, deleteBook };
