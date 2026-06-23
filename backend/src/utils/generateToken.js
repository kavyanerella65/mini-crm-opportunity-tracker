const jwt = require('jsonwebtoken');

/**
 * Signs a JWT carrying only the user's id. Expiry defaults to 2 hours per the
 * assignment spec, but is configurable via JWT_EXPIRES_IN.
 */
const generateToken = (userId) =>
  jwt.sign({ id: userId.toString() }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '2h',
  });

module.exports = generateToken;
