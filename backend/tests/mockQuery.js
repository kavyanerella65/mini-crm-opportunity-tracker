/**
 * Mongoose queries are "thenable" and chainable: `User.findOne(...)` can be
 * awaited directly OR chained with `.select()`, `.populate()`, etc. before
 * being awaited. This helper builds a fake query object that supports both
 * usages so controller code can be tested without a real database.
 */
const mockQuery = (resolvedValue) => {
  const query = {};
  ['select', 'populate', 'sort', 'skip', 'limit'].forEach((method) => {
    query[method] = jest.fn().mockReturnValue(query);
  });
  query.then = (resolve, reject) => Promise.resolve(resolvedValue).then(resolve, reject);
  query.catch = (reject) => Promise.resolve(resolvedValue).catch(reject);
  return query;
};

module.exports = mockQuery;
