const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema(
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
    assignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assignment',
    },

    // Chat Metadata
    conversationStatus: {
      type: String,
      enum: ['active', 'resolved', 'on_hold', 'closed'],
      default: 'active',
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
    },
    category: {
      type: String,
      enum: ['filing_status', 'document_review', 'deadline', 'payment', 'technical_issue', 'general_inquiry'],
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },

    // Messages
    messages: [
      {
        senderId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        senderRole: {
          type: String,
          enum: ['client', 'accountant'],
        },
        message: {
          type: String,
          required: [true, 'Message content is required'],
        },
        attachments: [
          {
            fileName: String,
            filePath: String,
            fileSize: Number,
            uploadedAt: Date,
          },
        ],
        timestamp: {
          type: Date,
          default: Date.now,
        },
        isRead: {
          type: Boolean,
          default: false,
        },
        readAt: Date,
      },
    ],

    // Chat Activity
    lastMessage: String,
    lastMessageAt: Date,
    lastMessageBy: mongoose.Schema.Types.ObjectId,
    messageCount: {
      type: Number,
      default: 0,
    },

    // Status Tracking
    isResolved: {
      type: Boolean,
      default: false,
    },
    resolvedAt: Date,
    resolutionNotes: String,
    ratingGiven: {
      type: Number,
      min: 1,
      max: 5,
    },
    feedback: String,

    // Metadata
    tags: [String],
    notes: String,
  },
  {
    timestamps: true,
  }
);

// Update message count on save
chatSchema.pre('save', async function () {
  if (this.messages) {
    this.messageCount = this.messages.length;
    if (this.messages.length > 0) {
      const lastMsg = this.messages[this.messages.length - 1];
      this.lastMessage = lastMsg.message;
      this.lastMessageAt = lastMsg.timestamp;
      this.lastMessageBy = lastMsg.senderId;
    }
  }
});

// Indexes for performance
chatSchema.index({ clientId: 1 });
chatSchema.index({ accountantId: 1 });
chatSchema.index({ conversationStatus: 1 });
chatSchema.index({ clientId: 1, accountantId: 1 });
chatSchema.index({ lastMessageAt: -1 });
chatSchema.index({ 'messages.senderId': 1 });

module.exports = mongoose.model('Chat', chatSchema);
