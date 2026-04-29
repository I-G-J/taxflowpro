const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    month: {
      type: String,
      required: [true, 'Month is required'],
      match: [/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format'],
    },
    category: {
      type: String,
      enum: [
        'gst_registration',
        'gst_return',
        'itr',
        'tds',
        'purchase_register',
        'sales_register',
        'bank_statement',
        'invoice',
        'receipt',
        'expense',
        'other',
      ],
      required: [true, 'Category is required'],
    },
    files: [
      {
        originalName: String,
        fileName: String,
        filePath: String,
        fileSize: Number,
        mimeType: String,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    notes: String,
    status: {
      type: String,
      enum: ['uploaded', 'under_review', 'approved', 'rejected'],
      default: 'uploaded',
    },
    reviewNotes: String,
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: Date,

    // Metadata
    totalFileSize: Number,
    fileCount: Number,
  },
  {
    timestamps: true,
  }
);

// Calculate totals before save
documentSchema.pre('save', async function () {
  if (this.files && this.files.length > 0) {
    this.fileCount = this.files.length;
    this.totalFileSize = this.files.reduce((sum, file) => sum + (file.fileSize || 0), 0);
  }
});

// Indexes for performance
documentSchema.index({ userId: 1, month: 1 });
documentSchema.index({ userId: 1, category: 1 });
documentSchema.index({ status: 1 });
documentSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Document', documentSchema);
