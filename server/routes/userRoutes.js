const express = require('express');
const {
  getProfile,
  updateProfile,
  updateKYC,
  verifyKYCStatus,
  getDashboardStats,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  getAccountants,
} = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/multer');

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', authenticate, getProfile);

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', authenticate, updateProfile);

// @route   PUT /api/users/kyc
// @desc    Update KYC information
// @access  Private
router.put(
  '/kyc',
  authenticate,
  upload.fields([
    { name: 'aadharDocument', maxCount: 1 },
    { name: 'panDocument', maxCount: 1 },
    { name: 'gstinDocument', maxCount: 1 },
    { name: 'bankDocument', maxCount: 1 },
  ]),
  updateKYC
);

// @route   GET /api/users/dashboard
// @desc    Get dashboard statistics
// @access  Private
router.get('/dashboard', authenticate, getDashboardStats);

// Admin routes
// @route   GET /api/users
// @desc    Get all users (Admin only)
// @access  Private (Admin)
router.get('/', authenticate, authorize('admin'), getAllUsers);

// @route   POST /api/users
// @desc    Create new user (Admin only)
// @access  Private (Admin)
router.post('/', authenticate, authorize('admin'), createUser);

// @route   PUT /api/users/:userId
// @desc    Update user (Admin only)
// @access  Private (Admin)
router.put('/:userId', authenticate, authorize('admin'), updateUser);

// @route   PUT /api/users/:userId/kyc-status
// @desc    Verify or update user KYC status
// @access  Private (Admin/Accountant)
router.put('/:userId/kyc-status', authenticate, authorize('admin', 'accountant'), verifyKYCStatus);

// @route   DELETE /api/users/:userId
// @desc    Delete user (Admin only)
// @access  Private (Admin)
router.delete('/:userId', authenticate, authorize('admin'), deleteUser);

// @route   GET /api/users/accountants
// @desc    Get all accountants
// @access  Private
router.get('/accountants/list', authenticate, getAccountants);

// Debug test route
router.get('/test', (req, res) => {
  res.send('User routes working');
});

module.exports = router;
