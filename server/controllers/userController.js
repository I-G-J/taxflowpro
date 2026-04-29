const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const { SUCCESS_MESSAGES, ERROR_MESSAGES, KYC_STATUS } = require('../utils/constants');

const normalizeBusinessType = (value) => {
  if (!value) return value;

  const normalized = value.toString().trim().toLowerCase();

  switch (normalized) {
    case 'company':
    case 'private limited':
    case 'private limited company':
    case 'pvt ltd':
      return 'pvt_ltd';
    case 'sole':
    case 'sole proprietor':
    case 'sole proprietorship':
      return 'sole_proprietor';
    case 'partnership':
      return 'partnership';
    case 'llp':
      return 'llp';
    case 'ngo':
      return 'ngo';
    case 'other':
      return 'other';
    default:
      return normalized;
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return errorResponse(res, 404, ERROR_MESSAGES.NOT_FOUND);
    }

    return successResponse(res, 200, 'Profile fetched successfully', user.getPublicProfile());
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, phone, businessName, businessType, address, city, state, pincode, gstin, pan } = req.body;

    const user = await User.findById(req.userId);

    if (!user) {
      return errorResponse(res, 404, ERROR_MESSAGES.NOT_FOUND);
    }

    // Update allowed fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone) user.phone = phone;
    if (businessName) user.businessName = businessName;
    if (businessType) user.businessType = normalizeBusinessType(businessType);
    if (address) user.address = address;
    if (city) user.city = city;
    if (state) user.state = state;
    if (pincode) user.pincode = pincode;
    if (gstin) user.gstin = gstin;
    if (pan) user.pan = pan;

    await user.save();

    return successResponse(res, 200, SUCCESS_MESSAGES.PROFILE_UPDATED, user.getPublicProfile());
  } catch (error) {
    next(error);
  }
};

// @desc    Update KYC details
// @route   PUT /api/users/kyc
// @access  Private
const updateKYC = async (req, res, next) => {
  try {
    const { gstin, pan, aadhar } = req.body;
    const files = req.files || {};

    const user = await User.findById(req.userId);

    if (!user) {
      return errorResponse(res, 404, ERROR_MESSAGES.NOT_FOUND);
    }

    if (gstin) user.gstin = gstin;
    if (pan) user.pan = pan;

    const existingDocs = user.kycDocuments || {};

    if (aadhar) existingDocs.aadhar = aadhar;
    if (pan) existingDocs.pan = pan;
    if (gstin) existingDocs.gstin = gstin;

    if (files.aadharDocument?.[0]) {
      existingDocs.aadhar = `/uploads/${req.userId}/${files.aadharDocument[0].filename}`;
    }
    if (files.panDocument?.[0]) {
      existingDocs.pan = `/uploads/${req.userId}/${files.panDocument[0].filename}`;
    }
    if (files.gstinDocument?.[0]) {
      existingDocs.gstin = `/uploads/${req.userId}/${files.gstinDocument[0].filename}`;
    }
    if (files.bankDocument?.[0]) {
      existingDocs.bankProof = `/uploads/${req.userId}/${files.bankDocument[0].filename}`;
    }

    user.kycDocuments = existingDocs;
    user.kycStatus = 'in_progress';

    await user.save();

    return successResponse(res, 200, 'KYC updated successfully', user.getPublicProfile());
  } catch (error) {
    next(error);
  }
};

// @desc    Get user dashboard statistics (for client)
// @route   GET /api/users/dashboard/stats
// @access  Private
const getDashboardStats = async (req, res, next) => {
  try {
    const Filing = require('../models/Filing');
    const Invoice = require('../models/Invoice');
    const Document = require('../models/Document');

    const userId = req.userId;

    const totalFilings = await Filing.countDocuments({ clientId: userId });
    const completedFilings = await Filing.countDocuments({
      clientId: userId,
      status: 'acknowledged',
    });
    const pendingFilings = await Filing.countDocuments({
      clientId: userId,
      status: { $in: ['draft', 'pending', 'under_review'] },
    });

    const totalInvoices = await Invoice.countDocuments({ clientId: userId });
    const pendingInvoices = await Invoice.countDocuments({
      clientId: userId,
      paymentStatus: { $in: ['unpaid', 'overdue'] },
    });
    const totalPaid = await Invoice.aggregate([
      { $match: { clientId: userId, paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);

    const uploadedDocuments = await Document.countDocuments({ userId });
    const pendingDocuments = await Document.countDocuments({
      userId,
      status: 'uploaded',
    });

    const complianceScore = totalFilings > 0
      ? Math.round((completedFilings / totalFilings) * 100)
      : 0;

    return successResponse(res, 200, 'Dashboard stats fetched successfully', {
      filings: {
        total: totalFilings,
        completed: completedFilings,
        pending: pendingFilings,
      },
      invoices: {
        total: totalInvoices,
        pending: pendingInvoices,
        totalPaid: totalPaid[0]?.total || 0,
      },
      documents: {
        uploaded: uploadedDocuments,
        pending: pendingDocuments,
      },
      complianceScore,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    List all users (admin only)
// @route   GET /api/users
// @access  Private/Admin
const listAllUsers = async (req, res, next) => {
  try {
    const { role, page = 1, limit = 10 } = req.query;

    const query = {};
    if (role) query.role = role;

    const users = await User.find(query)
      .select('-password')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    return successResponse(res, 200, 'Users fetched successfully', {
      users,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create staff account (admin only)
// @route   POST /api/users/create-staff
// @access  Private/Admin
const createStaffAccount = async (req, res, next) => {
  try {
    const { firstName, lastName, email, phone, password, role, specialization } = req.body;

    if (!firstName || !lastName || !email || !phone || !password || !role) {
      return errorResponse(res, 400, 'Please provide all required fields');
    }

    // Only admin can create staff accounts, and only for admin/accountant roles
    if (!['admin', 'accountant'].includes(role)) {
      return errorResponse(res, 400, 'Invalid role. Can only create admin or accountant accounts');
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return errorResponse(res, 400, ERROR_MESSAGES.EMAIL_EXISTS);
    }

    const newUser = new User({
      firstName,
      lastName,
      email,
      phone,
      password,
      role,
      specialization,
    });

    await newUser.save();

    return successResponse(res, 201, 'Staff account created successfully', newUser.getPublicProfile());
  } catch (error) {
    next(error);
  }
};

// @desc    Get all accountants
// @route   GET /api/users/accountants/list
// @access  Private
const getAccountants = async (req, res, next) => {
  try {
    const accountants = await User.find({ role: 'accountant', isActive: true })
      .select('-password')
      .sort({ createdAt: -1 });

    return successResponse(res, 200, 'Accountants fetched successfully', accountants);
  } catch (error) {
    next(error);
  }
};

// @desc    Update user (admin only)
// @route   PUT /api/users/:userId
// @access  Private/Admin
const updateUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { firstName, lastName, email, phone, role, isActive, specialization } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return errorResponse(res, 404, ERROR_MESSAGES.NOT_FOUND);
    }

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (role) user.role = role;
    if (typeof isActive === 'boolean') user.isActive = isActive;
    if (specialization) user.specialization = specialization;

    await user.save();

    return successResponse(res, 200, 'User updated successfully', user.getPublicProfile());
  } catch (error) {
    next(error);
  }
};

// @desc    Deactivate user account
// @route   PUT /api/users/:userId/deactivate
// @access  Private/Admin
const deactivateUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await User.findByIdAndUpdate(userId, { isActive: false }, { new: true });

    if (!user) {
      return errorResponse(res, 404, ERROR_MESSAGES.NOT_FOUND);
    }

    return successResponse(res, 200, 'User deactivated successfully', user.getPublicProfile());
  } catch (error) {
    next(error);
  }
};

// @desc    Verify or update user KYC status
// @route   PUT /api/users/:userId/kyc-status
// @access  Private (Admin / Accountant)
const verifyKYCStatus = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    const allowedStatuses = ['not_started', 'in_progress', 'verified', 'rejected'];
    if (!status || !allowedStatuses.includes(status)) {
      return errorResponse(res, 400, 'Invalid KYC status');
    }

    const user = await User.findById(userId);
    if (!user) {
      return errorResponse(res, 404, ERROR_MESSAGES.NOT_FOUND);
    }

    if (req.userRole === 'accountant' && user.role !== 'client') {
      return errorResponse(res, 403, 'Accountants may only update client KYC statuses');
    }

    user.kycStatus = status;
    if (status === 'verified') {
      user.kycVerifiedAt = new Date();
      user.kycVerifiedBy = req.userId;
    } else if (status === 'rejected') {
      user.kycVerifiedAt = null;
      user.kycVerifiedBy = req.userId;
    }

    await user.save();

    return successResponse(res, 200, 'KYC status updated successfully', user.getPublicProfile());
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  updateKYC,
  verifyKYCStatus,
  getDashboardStats,
  getAllUsers: listAllUsers,
  listAllUsers,
  createUser: createStaffAccount,
  createStaffAccount,
  updateUser,
  deleteUser: deactivateUser,
  deactivateUser,
  getAccountants,
};
