const User = require('../models/User');

// GET /profile  (any logged-in user)
// Returns the logged-in user's details without the password
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    return res.status(200).json({ success: true, data: user });
  } catch (err) {
    return next(err);
  }
};

// GET /students  (admin only)
// Returns every student, without passwords
const getStudents = async (req, res, next) => {
  try {
    const students = await User.find({ role: 'student' })
      .select('-password')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: students.length,
      data: students,
    });
  } catch (err) {
    return next(err);
  }
};

module.exports = { getProfile, getStudents };
