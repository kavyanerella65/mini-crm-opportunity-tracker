const jwt = require('jsonwebtoken');
const asyncHandler = require('./asyncHandler');
const User = require('../models/User');

/**
 * Verifies the JWT sent as `Authorization: Bearer <token>`, loads the
 * corresponding user, and attaches it to req.user. This is the ONLY place
 * user identity is established for protected routes — controllers must
 * never trust a user id coming from the request body or query string.
 */
const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  let token;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    const message =
      error.name === 'TokenExpiredError'
        ? 'Session expired, please log in again'
        : 'Not authorized, invalid token';
    return res.status(401).json({ success: false, message });
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    return res.status(401).json({ success: false, message: 'Not authorized, user no longer exists' });
  }

  req.user = user;
  next();
});

module.exports = { protect };
