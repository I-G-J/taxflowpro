const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Client ID is required'],
    },
    accountantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Accountant ID is required'],
    },
    serviceType: {
      type: String,
      enum: ['gst_filing', 'itr_filing', 'tds_filing', 'compliance', 'full_support'],
      required: [true, 'Service type is required'],
    },
    filingType: {
      type: String,
      enum: ['gstr1', 'gstr3b', 'itr', 'tds', 'other'],
    },
    deadline: {
      type: Date,
      required: [true, 'Deadline is required'],
    },
    status: {
      type: String,
      enum: ['assigned', 'in_progress', 'completed', 'cancelled'],
      default: 'assigned',
    },
    notes: String,
    internalNotes: String, // Notes between admin and accountant

    // Assignment Details
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedAt: {
      type: Date,
      default: Date.now,
    },

    // Progress Tracking
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    documents_received: {
      type: Boolean,
      default: false,
    },
    documents_received_at: Date,
    filing_submitted: {
      type: Boolean,
      default: false,
    },
    filing_submitted_at: Date,
    acknowledgement_received: {
      type: Boolean,
      default: false,
    },
    acknowledgement_received_at: Date,
    acknowledgement_url: String,

    // Deassignment Tracking
    isDeassigned: {
      type: Boolean,
      default: false,
    },
    deassignedAt: Date,
    deassignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    deassignReason: String,
    reassignReason: String,
    reassignedAt: Date,

    // Communication
    lastCommunicationDate: Date,
    messages: [
      {
        senderId: mongoose.Schema.Types.ObjectId,
        message: String,
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
assignmentSchema.index({ clientId: 1 });
assignmentSchema.index({ accountantId: 1 });
assignmentSchema.index({ status: 1 });
assignmentSchema.index({ deadline: 1 });
assignmentSchema.index({ clientId: 1, status: 1 });
assignmentSchema.index({ accountantId: 1, status: 1 });

module.exports = mongoose.model('Assignment', assignmentSchema);
