const mongoose = require('mongoose');
const { STAGES, PRIORITIES } = require('../constants/enums');

const opportunitySchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true, // always set server-side from the authenticated user, never from the client
    },
    customerName: {
      type: String,
      required: [true, 'Customer / company name is required'],
      trim: true,
      maxlength: [150, 'Customer name cannot exceed 150 characters'],
    },
    contactName: { type: String, trim: true, maxlength: 100 },
    contactEmail: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid contact email'],
    },
    contactPhone: { type: String, trim: true, maxlength: 20 },
    requirement: {
      type: String,
      required: [true, 'Requirement / need summary is required'],
      trim: true,
      maxlength: [500, 'Requirement summary cannot exceed 500 characters'],
    },
    estimatedValue: {
      type: Number,
      min: [0, 'Estimated value cannot be negative'],
      default: 0,
    },
    stage: {
      type: String,
      enum: { values: STAGES, message: `Stage must be one of: ${STAGES.join(', ')}` },
      default: 'New',
    },
    priority: {
      type: String,
      enum: { values: PRIORITIES, message: `Priority must be one of: ${PRIORITIES.join(', ')}` },
      default: 'Medium',
    },
    nextFollowUpDate: { type: Date, default: null },
    notes: { type: String, trim: true, maxlength: 2000 },
  },
  { timestamps: true }
);

opportunitySchema.index({ stage: 1 });
opportunitySchema.index({ priority: 1 });
opportunitySchema.index({ owner: 1 });
opportunitySchema.index({ customerName: 'text', requirement: 'text' });

module.exports = mongoose.model('Opportunity', opportunitySchema);
