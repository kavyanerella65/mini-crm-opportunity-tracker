const jwt = require('jsonwebtoken');
const generateToken = require('../src/utils/generateToken');

describe('generateToken', () => {
  it('signs a token carrying the user id, verifiable with JWT_SECRET', () => {
    const token = generateToken('507f1f77bcf86cd799439011');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    expect(decoded.id).toBe('507f1f77bcf86cd799439011');
    expect(decoded.exp).toBeGreaterThan(decoded.iat);
  });

  it('produces a token that fails verification against the wrong secret', () => {
    const token = generateToken('507f1f77bcf86cd799439011');
    expect(() => jwt.verify(token, 'a-completely-different-secret')).toThrow();
  });
});
