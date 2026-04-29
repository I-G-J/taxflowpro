const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Client ID is required'],
    },
    invoiceNumber: {
      type: String,
      unique: true,
      required: true,
    },

    // Invoice Details
    serviceType: {
      type: String,
      enum: ['gst_filing', 'itr_filing', 'tds_filing', 'compliance', 'consulting', 'other'],
      required: [true, 'Service type is required'],
    },
    description: String,
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: 0,
    },
    currency: {
      type: String,
      default: 'INR',
    },

    // GST Details
    baseAmount: Number,
    gstRate: {
      type: Number,
      default: 18, // 18% GST default
    },
    gstAmount: Number,
    totalAmount: Number,

    // Dates
    invoiceDate: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      required: true,
    },

    // Payment Details
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'partial', 'paid', 'overdue', 'cancelled'],
      default: 'unpaid',
    },
    paymentMethod: {
      type: String,
      enum: ['credit_card', 'debit_card', 'net_banking', 'upi', 'razorpay', 'check', 'bank_transfer'],
    },
    paymentDate: Date,
    transactionId: String,
    razorpayOrderId: String,
    razorpayPaymentId: String,

    // Document URLs
    invoiceUrl: String,
    receiptUrl: String,

    // Payment History
    payments: [
      {
        paymentDate: Date,
        amount: Number,
        method: String,
        transactionId: String,
        notes: String,
      },
    ],

    // Metadata
    notes: String,
    remarks: String,
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurringFrequency: {
      type: String,
      enum: ['monthly', 'quarterly', 'half-yearly', 'yearly'],
    },
    previousInvoiceId: mongoose.Schema.Types.ObjectId,
    nextInvoiceId: mongoose.Schema.Types.ObjectId,
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to calculate GST and total
invoiceSchema.pre('save', function (next) {
  if (this.baseAmount && this.gstRate) {
    this.gstAmount = Math.round((this.baseAmount * this.gstRate) / 100);
    this.totalAmount = this.baseAmount + this.gstAmount;
  } else if (this.amount) {
    this.totalAmount = this.amount;
  }
  next();
});

// Generate invoice number if not provided
invoiceSchema.pre('save', async function () {
  if (!this.invoiceNumber) {
    const count = await this.constructor.countDocuments();
    this.invoiceNumber = `INV-${Date.now()}-${count + 1}`;
  }
});

// Indexes for performance
invoiceSchema.index({ clientId: 1 });
invoiceSchema.index({ paymentStatus: 1 });
invoiceSchema.index({ invoiceDate: -1 });
invoiceSchema.index({ dueDate: 1 });
invoiceSchema.index({ clientId: 1, paymentStatus: 1 });

module.exports = mongoose.model('Invoice', invoiceSchema);
