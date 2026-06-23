const express = require('express');
const {
  createOpportunity,
  getOpportunities,
  getSummary,
  getOpportunityById,
  updateOpportunity,
  deleteOpportunity,
} = require('../controllers/opportunityController');
const { protect } = require('../middleware/authMiddleware');
const { validate, opportunityCreateRules, opportunityUpdateRules } = require('../middleware/validators');

const router = express.Router();

// Every opportunity route requires a valid JWT.
router.use(protect);

// NOTE: /summary must be declared before the /:id route, otherwise Express
// would try to match "summary" as an :id value.
router.get('/summary', getSummary);

router.route('/').get(getOpportunities).post(opportunityCreateRules, validate, createOpportunity);

router
  .route('/:id')
  .get(getOpportunityById)
  .put(opportunityUpdateRules, validate, updateOpportunity)
  .delete(deleteOpportunity);

module.exports = router;
