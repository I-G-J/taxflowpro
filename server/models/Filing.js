const mongoose = require('mongoose');

const filingSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Client ID is required'],
    },
    accountantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    assignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assignment',
    },

    // Filing Details
    filingType: {
      type: String,
      enum: ['gstr1', 'gstr3b', 'gstr2b', 'itr', 'tds', 'tcs', 'other'],
      required: [true, 'Filing type is required'],
    },
    filingPeriod: {
      type: String,
      required: [true, 'Filing period is required'],
      match: [/^\d{4}-\d{2}(-\d{2})?$/, 'Filing period must be in YYYY-MM or YYYY-MM-DD format'],
    },
    financialYear: {
      type: String,
      required: true,
    },

    // Filing Status
    status: {
      type: String,
      enum: ['draft', 'pending', 'under_review', 'submitted', 'acknowledged', 'rejected', 'amended'],
      default: 'draft',
    },

    // Submission Details
    submittedDate: Date,
    rejectionReason: String,
    rejectionDate: Date,
    amendmentNumber: {
      type: Number,
      default: 0,
    },

    // Documents
    documents: [
      {
        docType: String,
        docName: String,
        filePath: String,
        uploadedAt: Date,
      },
    ],

    // Acknowledgement
    acknowledgementNumber: String,
    acknowledgementReceived: {
      type: Boolean,
      default: false,
    },
    acknowledgementReceivedDate: Date,
    acknowledgementDocument: String,

    // Financial Details (for ITR, TDS)
    totalIncome: Number,
    taxableIncome: Number,
    taxAmount: Number,
    challanNumber: String,
    challanDate: Date,

    // GST Specific
    gstDetails: {
      inwardSupplies: Number,
      outwardSupplies: Number,
      taxableValue: Number,
      igst: Number,
      cgst: Number,
      sgst: Number,
      cess: Number,
      totalTax: Number,
    },

    // Notes & Comments
    notes: String,
    internalNotes: String,

    // Deadlines
    originalDeadline: Date,
    revisedDeadline: Date,
    isLate: {
      type: Boolean,
      default: false,
    },
    latePenalty: Number,
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
filingSchema.index({ clientId: 1, filingPeriod: 1 });
filingSchema.index({ accountantId: 1, status: 1 });
filingSchema.index({ filingType: 1, status: 1 });
filingSchema.index({ status: 1 });
filingSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Filing', filingSchema);
