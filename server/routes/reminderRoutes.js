const express = require('express');
const {
  createReminder,
  getReminders,
  updateReminderStatus,
  createAutoReminders,
  sendPendingReminders,
} = require('../controllers/reminderController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/reminders
// @desc    Create reminder
// @access  Private
router.post('/', authenticate, createReminder);

// @route   GET /api/reminders
// @desc    Get reminders
// @access  Private
router.get('/', authenticate, getReminders);

// @route   PUT /api/reminders/:reminderId/status
// @desc    Update reminder status
// @access  Private
router.put('/:reminderId/status', authenticate, updateReminderStatus);

// @route   POST /api/reminders/auto
// @desc    Create automatic reminders
// @access  Private
router.post('/auto', authenticate, createAutoReminders);

// @route   POST /api/reminders/send-pending
// @desc    Send pending reminders (Admin/System)
// @access  Private (Admin)
router.post('/send-pending', authenticate, authorize('admin'), sendPendingReminders);

// Debug test route
router.get('/test', (req, res) => {
  res.send('Reminder routes working');
});

module.exports = router;
