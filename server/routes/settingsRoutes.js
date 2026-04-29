const express = require('express');
const { getDashboardSettings, updateDashboardSettings } = require('../controllers/settingController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/settings/dashboard
// @desc    Get dashboard settings
// @access  Public
router.get('/dashboard', getDashboardSettings);

// @route   PUT /api/settings/dashboard
// @desc    Update dashboard settings
// @access  Private (Admin)
router.put('/dashboard', authenticate, authorize('admin'), updateDashboardSettings);

module.exports = router;
