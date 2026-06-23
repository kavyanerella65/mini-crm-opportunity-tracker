const asyncHandler = require('../middleware/asyncHandler');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  createdAt: user.createdAt,
});

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return res.status(409).json({ success: false, message: 'An account with this email already exists' });
  }

  const user = await User.create({ name, email, password });

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: { user: sanitizeUser(user), token: generateToken(user._id) },
  });
});

// @desc    Authenticate a user and return a JWT
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // password has `select: false` on the schema, so it must be explicitly requested here
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    // Deliberately identical message/status for "no such user" and "wrong password"
    // so the API never reveals which emails are registered.
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: { user: sanitizeUser(user), token: generateToken(user._id) },
  });
});

// @desc    Get the logged-in user's profile
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, data: { user: sanitizeUser(req.user) } });
});

module.exports = { registerUser, loginUser, getMe };
