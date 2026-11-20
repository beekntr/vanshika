const mongoose = require('mongoose');

// Book model – fields exactly as asked in Task 1
const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    author: {
      type: String,
      required: [true, 'Author is required'],
      trim: true,
    },
    price: {
      type: Number,
      min: [1, 'Price must be at least 1'],
    },
    category: {
      type: String,
      trim: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // adds createdAt / updatedAt
    versionKey: false, // hides the __v field
  }
);

module.exports = mongoose.model('Book', bookSchema);
