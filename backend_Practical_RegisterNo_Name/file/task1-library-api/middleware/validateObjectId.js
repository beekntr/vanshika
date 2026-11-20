// Rejects ids that are not a valid MongoDB ObjectId (24 hex characters)
// with 400, so a bad id never reaches the database.
const validateObjectId = (req, res, next) => {
  const { id } = req.params;
  if (!/^[a-fA-F0-9]{24}$/.test(id)) {
    return res.status(400).json({
      success: false,
      message: `Invalid book id: "${id}"`,
    });
  }
  return next();
};

module.exports = validateObjectId;
