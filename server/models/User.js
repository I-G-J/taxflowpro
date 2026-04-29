const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    // Basic Info
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
    },
    phone: {
      type: String,
      required: [true, 'Phone is required'],
      match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit phone number'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false, // Don't return password in queries by default
    },

    // Role & Status
    role: {
      type: String,
      enum: ['client', 'admin', 'accountant'],
      default: 'client',
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },

    // Client-specific fields
    businessName: String,
    businessType: {
      type: String,
      enum: ['sole_proprietor', 'partnership', 'pvt_ltd', 'llp', 'ngo', 'other'],
    },
    gstin: {
      type: String,
      validate: {
        validator: function (v) {
          return !v || /^[0-9A-Z]{15}$/.test(v); // GSTIN format
        },
        message: 'Invalid GSTIN format',
      },
    },
    pan: {
      type: String,
      validate: {
        validator: function (v) {
          return !v || /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(v); // PAN format
        },
        message: 'Invalid PAN format',
      },
    },
    address: String,
    city: String,
    state: String,
    pincode: String,

    // KYC Status
    kycStatus: {
      type: String,
      enum: ['not_started', 'in_progress', 'verified', 'rejected'],
      default: 'not_started',
    },
    kycVerifiedAt: Date,
    kycVerifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    kycDocuments: {
      aadhar: String,
      pan: String,
      gstin: String,
      bankProof: String,
    },

    // Admin/Accountant fields
    departmentHead: String, // For admin users
    specialization: String, // For accountant users (GST, ITR, TDS, etc.)

    // Settings
    emailNotifications: {
      type: Boolean,
      default: true,
    },
    smsNotifications: {
      type: Boolean,
      default: true,
    },

    // Metadata
    lastLogin: Date,
    loginCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (passwordToCheck) {
  return await bcrypt.compare(passwordToCheck, this.password);
};

// Method to get public profile (exclude sensitive data)
userSchema.methods.getPublicProfile = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

// Indexes for performance
// Note: email already has unique: true in schema definition (creates index automatically)
userSchema.index({ gstin: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ role: 1 });

module.exports = mongoose.model('User', userSchema);
