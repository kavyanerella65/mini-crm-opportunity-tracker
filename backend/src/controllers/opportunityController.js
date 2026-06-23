const asyncHandler = require('../middleware/asyncHandler');
const Opportunity = require('../models/Opportunity');
const { isOwner } = require('../utils/isOwner');
const { STAGES, PRIORITIES } = require('../constants/enums');

// Whitelist of fields a client is ever allowed to set. `owner` is
// intentionally absent — it is always derived from req.user (the JWT),
// never from the request body, per the assignment's security requirements.
const ALLOWED_FIELDS = [
  'customerName',
  'contactName',
  'contactEmail',
  'contactPhone',
  'requirement',
  'estimatedValue',
  'stage',
  'priority',
  'nextFollowUpDate',
  'notes',
];

const pickAllowedFields = (body = {}) => {
  const result = {};
  ALLOWED_FIELDS.forEach((field) => {
    if (body[field] !== undefined) result[field] = body[field];
  });
  return result;
};

// @desc    Create an opportunity owned by the logged-in user
// @route   POST /api/opportunities
// @access  Private
const createOpportunity = asyncHandler(async (req, res) => {
  const data = pickAllowedFields(req.body);

  const opportunity = await Opportunity.create({ ...data, owner: req.user._id });
  await opportunity.populate('owner', 'name email');

  res.status(201).json({ success: true, message: 'Opportunity created successfully', data: opportunity });
});

// @desc    List opportunities in the shared pipeline (with filter/search/sort/pagination)
// @route   GET /api/opportunities
// @access  Private
const getOpportunities = asyncHandler(async (req, res) => {
  const { stage, priority, search, sortBy, order, page, limit, mine } = req.query;

  const filter = {};
  if (stage && STAGES.includes(stage)) filter.stage = stage;
  if (priority && PRIORITIES.includes(priority)) filter.priority = priority;
  if (mine === 'true') filter.owner = req.user._id;
  if (search) {
    const regex = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ customerName: regex }, { contactName: regex }, { requirement: regex }];
  }

  const sortableFields = ['estimatedValue', 'nextFollowUpDate', 'createdAt', 'customerName'];
  const sortField = sortableFields.includes(sortBy) ? sortBy : 'createdAt';
  const sortOrder = order === 'asc' ? 1 : -1;

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
  const skip = (pageNum - 1) * limitNum;

  const [opportunities, total] = await Promise.all([
    Opportunity.find(filter)
      .populate('owner', 'name email')
      .sort({ [sortField]: sortOrder, _id: -1 })
      .skip(skip)
      .limit(limitNum),
    Opportunity.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: opportunities,
    pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.max(Math.ceil(total / limitNum), 1) },
  });
});

// @desc    Dashboard summary stats across the shared pipeline
// @route   GET /api/opportunities/summary
// @access  Private
const getSummary = asyncHandler(async (req, res) => {
  const [openValueAgg, wonValueAgg, highPriorityOpen, total] = await Promise.all([
    Opportunity.aggregate([
      { $match: { stage: { $nin: ['Won', 'Lost'] } } },
      { $group: { _id: null, total: { $sum: '$estimatedValue' } } },
    ]),
    Opportunity.aggregate([{ $match: { stage: 'Won' } }, { $group: { _id: null, total: { $sum: '$estimatedValue' } } }]),
    Opportunity.countDocuments({ priority: 'High', stage: { $nin: ['Won', 'Lost'] } }),
    Opportunity.countDocuments(),
  ]);

  res.status(200).json({
    success: true,
    data: {
      totalOpportunities: total,
      openPipelineValue: openValueAgg[0]?.total || 0,
      wonValue: wonValueAgg[0]?.total || 0,
      highPriorityOpen,
    },
  });
});

// @desc    Get a single opportunity by id
// @route   GET /api/opportunities/:id
// @access  Private
const getOpportunityById = asyncHandler(async (req, res) => {
  const opportunity = await Opportunity.findById(req.params.id).populate('owner', 'name email');

  if (!opportunity) {
    return res.status(404).json({ success: false, message: 'Opportunity not found' });
  }

  res.status(200).json({ success: true, data: opportunity });
});

// @desc    Update an opportunity (owner only)
// @route   PUT /api/opportunities/:id
// @access  Private
const updateOpportunity = asyncHandler(async (req, res) => {
  const opportunity = await Opportunity.findById(req.params.id);

  if (!opportunity) {
    return res.status(404).json({ success: false, message: 'Opportunity not found' });
  }

  // Ownership is re-validated here on the backend (not just hidden in the UI),
  // using the user id that came from the verified JWT — never from the request body.
  if (!isOwner(opportunity.owner, req.user._id)) {
    return res.status(403).json({ success: false, message: 'You can only update opportunities you created' });
  }

  Object.assign(opportunity, pickAllowedFields(req.body));
  await opportunity.save();
  await opportunity.populate('owner', 'name email');

  res.status(200).json({ success: true, message: 'Opportunity updated successfully', data: opportunity });
});

// @desc    Delete an opportunity (owner only)
// @route   DELETE /api/opportunities/:id
// @access  Private
const deleteOpportunity = asyncHandler(async (req, res) => {
  const opportunity = await Opportunity.findById(req.params.id);

  if (!opportunity) {
    return res.status(404).json({ success: false, message: 'Opportunity not found' });
  }

  if (!isOwner(opportunity.owner, req.user._id)) {
    return res.status(403).json({ success: false, message: 'You can only delete opportunities you created' });
  }

  await opportunity.deleteOne();

  res.status(200).json({ success: true, message: 'Opportunity deleted successfully' });
});

module.exports = {
  createOpportunity,
  getOpportunities,
  getSummary,
  getOpportunityById,
  updateOpportunity,
  deleteOpportunity,
};
