const { body, validationResult } = require('express-validator');
const { STAGES, PRIORITIES } = require('../constants/enums');

/**
 * Runs after any *Rules array below; if express-validator collected any
 * errors, responds with 400 and a field-level error list instead of
 * letting the request reach the controller.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

const registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
];

const loginRules = [
  body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Please provide a valid email address'),
  body('password').notEmpty().withMessage('Password is required'),
];

// Shared field-level rules for opportunity create/update. `optional()` is
// used on the update rules so partial updates (e.g. just changing stage)
// don't fail because customerName wasn't resent.
const opportunityFieldRules = (requireCore) => [
  requireCore
    ? body('customerName').trim().notEmpty().withMessage('Customer / company name is required')
    : body('customerName').optional().trim().notEmpty().withMessage('Customer / company name cannot be empty'),
  requireCore
    ? body('requirement').trim().notEmpty().withMessage('Requirement / need summary is required')
    : body('requirement').optional().trim().notEmpty().withMessage('Requirement summary cannot be empty'),
  body('contactEmail').optional({ checkFalsy: true }).isEmail().withMessage('Please provide a valid contact email'),
  body('contactPhone').optional({ checkFalsy: true }).isString().trim().isLength({ max: 20 }).withMessage('Contact phone is too long'),
  body('estimatedValue')
    .optional({ checkFalsy: true })
    .isFloat({ min: 0 })
    .withMessage('Estimated value must be a non-negative number'),
  body('stage').optional().isIn(STAGES).withMessage(`Stage must be one of: ${STAGES.join(', ')}`),
  body('priority').optional().isIn(PRIORITIES).withMessage(`Priority must be one of: ${PRIORITIES.join(', ')}`),
  body('nextFollowUpDate').optional({ checkFalsy: true }).isISO8601().withMessage('Next follow-up date must be a valid date'),
  body('notes').optional().isString().isLength({ max: 2000 }).withMessage('Notes cannot exceed 2000 characters'),
  // Defense in depth: even though controllers never read these fields from
  // the body, explicitly reject attempts to set identity/ownership fields
  // directly so the intent is also enforced (and documented) at validation time.
  body(['owner', 'user_id', 'created_by']).not().exists().withMessage('Ownership cannot be set from the client'),
];

const opportunityCreateRules = opportunityFieldRules(true);
const opportunityUpdateRules = opportunityFieldRules(false);

module.exports = {
  validate,
  registerRules,
  loginRules,
  opportunityCreateRules,
  opportunityUpdateRules,
};
