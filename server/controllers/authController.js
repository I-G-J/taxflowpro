const User = require('../models/User');
const { generateToken } = require('../utils/jwt');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const { SUCCESS_MESSAGES, ERROR_MESSAGES, ROLES } = require('../utils/constants');

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

// @desc    Register a new client user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, phone, password, confirmPassword, businessName, businessType } = req.body;

    // Validation
    if (!firstName || !lastName || !email || !phone || !password || !confirmPassword) {
      return errorResponse(res, 400, 'Please provide all required fields');
    }

    if (password !== confirmPassword) {
      return errorResponse(res, 400, 'Passwords do not match');
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return errorResponse(res, 400, ERROR_MESSAGES.EMAIL_EXISTS);
    }

    const normalizedBusinessType = normalizeBusinessType(businessType);

    // Create new user (Always as CLIENT - cannot register as admin/accountant)
    const newUser = new User({
      firstName,
      lastName,
      email,
      phone,
      password,
      role: ROLES.CLIENT, // Force client role
      businessName,
      businessType: normalizedBusinessType,
    });

    await newUser.save();

    // Generate JWT token
    const token = generateToken(newUser._id, newUser.role);

    const userProfile = newUser.getPublicProfile();

    return successResponse(
      res,
      201,
      SUCCESS_MESSAGES.USER_CREATED,
      {
        token,
        user: userProfile,
      }
    );
  } catch (error) {
    return errorResponse(res, 500, error.message || 'Registration failed');
  }
};

// @desc    Login user (all roles)
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return errorResponse(res, 400, 'Please provide email and password');
    }

    // Find user by email and select password field
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return errorResponse(res, 401, ERROR_MESSAGES.INVALID_CREDENTIALS);
    }

    // Check if user is active
    if (!user.isActive) {
      return errorResponse(res, 403, 'Your account has been deactivated');
    }

    // Compare passwords
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return errorResponse(res, 401, ERROR_MESSAGES.INVALID_CREDENTIALS);
    }

    // Update last login
    user.lastLogin = new Date();
    user.loginCount = (user.loginCount || 0) + 1;
    await user.save();

    // Generate JWT token
    const token = generateToken(user._id, user.role);

    const userProfile = user.getPublicProfile();

    return successResponse(
      res,
      200,
      SUCCESS_MESSAGES.LOGIN_SUCCESS,
      {
        token,
        user: userProfile,
      }
    );
  } catch (error) {
    return errorResponse(res, 500, error.message || 'Login failed');
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return errorResponse(res, 404, ERROR_MESSAGES.NOT_FOUND);
    }

    return successResponse(res, 200, 'User fetched successfully', user.getPublicProfile());
  } catch (error) {
    return errorResponse(res, 500, error.message || 'Failed to fetch user');
  }
};

// @desc    Refresh JWT token
// @route   POST /api/auth/refresh
// @access  Private
const refreshToken = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);

    if (!user || !user.isActive) {
      return errorResponse(res, 401, ERROR_MESSAGES.UNAUTHORIZED);
    }

    const newToken = generateToken(user._id, user.role);

    return successResponse(res, 200, 'Token refreshed successfully', {
      token: newToken,
    });
  } catch (error) {
    return errorResponse(res, 500, error.message || 'Token refresh failed');
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return errorResponse(res, 400, 'Please provide all password fields');
    }

    if (newPassword !== confirmPassword) {
      return errorResponse(res, 400, 'Passwords do not match');
    }

    const user = await User.findById(req.userId).select('+password');

    if (!user) {
      return errorResponse(res, 404, ERROR_MESSAGES.NOT_FOUND);
    }

    const isCurrentPasswordValid = await user.comparePassword(currentPassword);

    if (!isCurrentPasswordValid) {
      return errorResponse(res, 401, 'Current password is incorrect');
    }

    user.password = newPassword;
    await user.save();

    return successResponse(res, 200, 'Password changed successfully');
  } catch (error) {
    return errorResponse(res, 500, error.message || 'Password change failed');
  }
};

// @desc    Forgot password (placeholder)
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return errorResponse(res, 400, 'Please provide email');
    }

    const user = await User.findOne({ email });
    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }

    // In a real application, you would:
    // 1. Generate a reset token
    // 2. Save it to the database with expiration
    // 3. Send reset link via email
    // For now, just return success message
    return successResponse(res, 200, 'Password reset instructions sent to email');
  } catch (error) {
    return errorResponse(res, 500, error.message || 'Forgot password failed');
  }
};

// @desc    Reset password (placeholder)
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;

    if (!token || !newPassword || !confirmPassword) {
      return errorResponse(res, 400, 'Please provide all required fields');
    }

    if (newPassword !== confirmPassword) {
      return errorResponse(res, 400, 'Passwords do not match');
    }

    // In a real application, you would:
    // 1. Verify the reset token
    // 2. Find the user associated with the token
    // 3. Update their password
    // 4. Invalidate the token
    // For now, just return success message
    return successResponse(res, 200, 'Password reset successfully');
  } catch (error) {
    return errorResponse(res, 500, error.message || 'Password reset failed');
  }
};

module.exports = {
  register,
  login,
  getCurrentUser,
  refreshToken,
  changePassword,
  forgotPassword,
  resetPassword,
};
