const { isOwner } = require('../src/utils/isOwner');

describe('isOwner', () => {
  it('returns true when ids match as strings', () => {
    expect(isOwner('507f1f77bcf86cd799439011', '507f1f77bcf86cd799439011')).toBe(true);
  });

  it('returns true when one id is an ObjectId-like object with matching toString()', () => {
    const objectIdLike = { toString: () => '507f1f77bcf86cd799439011' };
    expect(isOwner(objectIdLike, '507f1f77bcf86cd799439011')).toBe(true);
  });

  it('returns false when ids differ', () => {
    expect(isOwner('507f1f77bcf86cd799439011', '507f1f77bcf86cd799439099')).toBe(false);
  });

  it('returns false when either id is missing', () => {
    expect(isOwner(null, '507f1f77bcf86cd799439011')).toBe(false);
    expect(isOwner('507f1f77bcf86cd799439011', undefined)).toBe(false);
  });
});
