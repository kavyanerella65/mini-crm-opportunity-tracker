// Single source of truth for enum values used by the Opportunity model,
// request validators, and (mirrored) the frontend dropdowns.

const STAGES = ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Won', 'Lost'];
const PRIORITIES = ['Low', 'Medium', 'High'];

module.exports = { STAGES, PRIORITIES };
