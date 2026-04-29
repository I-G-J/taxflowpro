const Setting = require('../models/Setting');
const { successResponse, errorResponse } = require('../utils/responseHandler');

const DEFAULT_DASHBOARD_SETTINGS = {
  heroMeta: {
    lastFiling: 'April 30, 2026',
    upcomingDeadline: {
      title: 'GSTR-1 Due',
      date: '2026-05-10',
    },
  },
  heroHighlights: [
    { label: 'Next Filing', value: 'GSTR-1', detail: '5 Days' },
    { label: 'Monthly Target', value: '₹45,000', detail: '75% Complete' },
    { label: 'Compliance Alerts', value: '3', detail: 'Critical items' },
  ],
  deadlines: [
    { title: 'GSTR-1 Due', date: '2026-05-10' },
    { title: 'ITR Filing Due', date: '2026-07-31' },
    { title: 'TDS Due', date: '2026-05-15' },
  ],
};

// @desc    Get dashboard settings
// @route   GET /api/settings/dashboard
// @access  Public
const getDashboardSettings = async (req, res, next) => {
  try {
    let settings = await Setting.findOne({ key: 'dashboard' });

    if (!settings) {
      settings = await Setting.create({
        key: 'dashboard',
        value: DEFAULT_DASHBOARD_SETTINGS,
      });
    }

    return successResponse(res, 200, 'Dashboard settings fetched successfully', settings.value);
  } catch (error) {
    console.error('Get dashboard settings error:', error);
    return errorResponse(res, 500, 'Failed to fetch dashboard settings');
  }
};

// @desc    Update dashboard settings
// @route   PUT /api/settings/dashboard
// @access  Private (Admin)
const updateDashboardSettings = async (req, res, next) => {
  try {
    const { value } = req.body;

    if (!value || typeof value !== 'object') {
      return errorResponse(res, 400, 'Invalid settings payload');
    }

    const settings = await Setting.findOneAndUpdate(
      { key: 'dashboard' },
      { value },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return successResponse(res, 200, 'Dashboard settings updated successfully', settings.value);
  } catch (error) {
    console.error('Update dashboard settings error:', error);
    return errorResponse(res, 500, 'Failed to update dashboard settings');
  }
};

module.exports = {
  getDashboardSettings,
  updateDashboardSettings,
};
