/**
 * Returns true when the given document's `owner` field matches the
 * authenticated user's id. Pulled out as a pure-ish helper (rather than
 * inlined in the controller) so the core authorization rule is easy to
 * unit test in isolation from Express and Mongoose.
 */
const isOwner = (resourceOwnerId, requestingUserId) => {
  if (!resourceOwnerId || !requestingUserId) return false;
  return resourceOwnerId.toString() === requestingUserId.toString();
};

module.exports = { isOwner };
