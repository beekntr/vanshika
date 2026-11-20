const jwt = require('jsonwebtoken');
const User = require('../models/User');

const TOKEN_EXPIRY = '1h'; // JWT expires in 1 hour

const signToken = (user) =>
  jwt.sign({ id: user._id.toString(), role: user.role }, process.env.JWT_SECRET, {
    expiresIn: TOKEN_EXPIRY,
  });

// POST /register
// Body: { name, email, password, role }   (already validated by Joi)
const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Reject a duplicate email
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Email is already registered',
      });
    }

    // Password is hashed with bcrypt in the User model's pre('save') hook
    const user = await User.create({ name, email, password, role });

    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: user, // toJSON removes the password
    });
  } catch (err) {
    return next(err); // duplicate key race -> 409 in errorHandler
  }
};

// POST /login
// Body: { email, password }  -> returns a JWT valid for 1 hour
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    const passwordOk = user ? await user.comparePassword(password) : false;

    if (!user || !passwordOk) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token: signToken(user),
      expiresIn: TOKEN_EXPIRY,
      data: user, // toJSON removes the password
    });
  } catch (err) {
    return next(err);
  }
};

module.exports = { register, login };
