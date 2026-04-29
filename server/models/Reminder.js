const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    reminderType: {
      type: String,
      enum: ['gst_filing', 'itr_filing', 'tds_filing', 'invoice_due', 'kyc_pending', 'document_review', 'custom'],
      required: [true, 'Reminder type is required'],
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
    },
    description: String,

    // Dates
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },
    reminderDates: [
      {
        date: Date,
        type: {
          type: String,
          enum: ['email', 'sms', 'in_app', 'push'],
          default: 'email',
        },
        sent: {
          type: Boolean,
          default: false,
        },
        sentAt: Date,
      },
    ],

    // Related Documents
    relatedEntityId: mongoose.Schema.Types.ObjectId, // Could be Filing, Invoice, etc.
    relatedEntityType: {
      type: String,
      enum: ['filing', 'invoice', 'assignment', 'document', 'general'],
      default: 'general',
    },

    // Status
    status: {
      type: String,
      enum: ['pending', 'sent', 'completed', 'cancelled'],
      default: 'pending',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    completedAt: Date,
    completionNotes: String,

    // Notification Preferences
    notificationChannels: {
      email: {
        type: Boolean,
        default: true,
      },
      sms: {
        type: Boolean,
        default: false,
      },
      in_app: {
        type: Boolean,
        default: true,
      },
      push: {
        type: Boolean,
        default: false,
      },
    },

    // Frequency (for recurring reminders)
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurringPattern: {
      type: String,
      enum: ['daily', 'weekly', 'bi-weekly', 'monthly'],
    },

    // Metadata
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    notes: String,
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
reminderSchema.index({ userId: 1, status: 1 });
reminderSchema.index({ dueDate: 1 });
reminderSchema.index({ reminderType: 1, userId: 1 });
reminderSchema.index({ status: 1, dueDate: 1 });

module.exports = mongoose.model('Reminder', reminderSchema);
