const Reminder = require('../models/Reminder');
const User = require('../models/User');
const Assignment = require('../models/Assignment');
const Filing = require('../models/Filing');
const Invoice = require('../models/Invoice');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const { ERROR_MESSAGES, SUCCESS_MESSAGES } = require('../utils/constants');

// @desc    Create reminder
// @route   POST /api/reminders
// @access  Private
const createReminder = async (req, res, next) => {
  try {
    const {
      clientId,
      title,
      message,
      reminderType,
      reminderDate,
      priority = 'medium',
      channels = ['email'],
      relatedEntity,
      relatedEntityId,
    } = req.body;

    if (!clientId || !title || !message || !reminderType || !reminderDate) {
      return errorResponse(res, 400, 'Please provide all required fields');
    }

    // Verify client exists
    const client = await User.findById(clientId);
    if (!client || client.role !== 'client') {
      return errorResponse(res, 400, 'Invalid client ID');
    }

    // Validate related entity if provided
    if (relatedEntity && relatedEntityId) {
      let relatedModel;
      switch (relatedEntity) {
        case 'assignment':
          relatedModel = Assignment;
          break;
        case 'filing':
          relatedModel = Filing;
          break;
        case 'invoice':
          relatedModel = Invoice;
          break;
        default:
          return errorResponse(res, 400, 'Invalid related entity type');
      }

      const relatedDoc = await relatedModel.findById(relatedEntityId);
      if (!relatedDoc) {
        return errorResponse(res, 400, 'Related entity not found');
      }
    }

    const reminder = new Reminder({
      clientId,
      createdBy: req.userId,
      title,
      message,
      reminderType,
      reminderDate: new Date(reminderDate),
      priority,
      channels,
      relatedEntity,
      relatedEntityId,
    });

    await reminder.save();

    return successResponse(res, 201, SUCCESS_MESSAGES.REMINDER_CREATED, reminder);
  } catch (error) {
    next(error);
  }
};

// @desc    Get reminders
// @route   GET /api/reminders
// @access  Private
const getReminders = async (req, res, next) => {
  try {
    const { status, reminderType, page = 1, limit = 10 } = req.query;

    let query = {};

    if (req.userRole === 'client') {
      query.clientId = req.userId;
    } else if (req.userRole === 'accountant') {
      query.createdBy = req.userId;
    } else if (req.userRole === 'admin') {
      // Admin can see all
    }

    if (status) query.status = status;
    if (reminderType) query.reminderType = reminderType;

    const reminders = await Reminder.find(query)
      .populate('clientId', 'firstName lastName email phone')
      .populate('createdBy', 'firstName lastName email')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ reminderDate: 1 });

    const total = await Reminder.countDocuments(query);

    return successResponse(res, 200, 'Reminders fetched successfully', {
      reminders,
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

// @desc    Update reminder status
// @route   PUT /api/reminders/:reminderId/status
// @access  Private
const updateReminderStatus = async (req, res, next) => {
  try {
    const { reminderId } = req.params;
    const { status, sentAt, deliveryStatus } = req.body;

    const reminder = await Reminder.findById(reminderId);

    if (!reminder) {
      return errorResponse(res, 404, ERROR_MESSAGES.NOT_FOUND);
    }

    // Check authorization
    if (req.userRole === 'client' && reminder.clientId.toString() !== req.userId.toString()) {
      return errorResponse(res, 403, ERROR_MESSAGES.FORBIDDEN);
    }

    if (req.userRole === 'accountant' && reminder.createdBy.toString() !== req.userId.toString()) {
      return errorResponse(res, 403, ERROR_MESSAGES.FORBIDDEN);
    }

    if (status) reminder.status = status;
    if (sentAt) reminder.sentAt = new Date(sentAt);
    if (deliveryStatus) reminder.deliveryStatus = deliveryStatus;

    await reminder.save();

    return successResponse(res, 200, 'Reminder updated successfully', reminder);
  } catch (error) {
    next(error);
  }
};

// @desc    Create automatic reminders for deadlines
// @route   POST /api/reminders/auto
// @access  Private (Admin/Accountant)
const createAutoReminders = async (req, res, next) => {
  try {
    const { entityType, entityId, reminderDays = [7, 3, 1] } = req.body;

    if (!entityType || !entityId) {
      return errorResponse(res, 400, 'Entity type and ID are required');
    }

    let entity, deadline, clientId, title, message;

    switch (entityType) {
      case 'assignment':
        entity = await Assignment.findById(entityId).populate('clientId');
        if (!entity) return errorResponse(res, 404, 'Assignment not found');
        deadline = entity.deadline;
        clientId = entity.clientId._id;
        title = `Assignment Deadline Reminder - ${entity.serviceType}`;
        message = `Your ${entity.serviceType} assignment is due on ${deadline.toDateString()}. Please ensure all documents are submitted.`;
        break;

      case 'filing':
        entity = await Filing.findById(entityId).populate('clientId');
        if (!entity) return errorResponse(res, 404, 'Filing not found');
        deadline = entity.deadline;
        clientId = entity.clientId._id;
        title = `Filing Deadline Reminder - ${entity.filingType}`;
        message = `Your ${entity.filingType} filing for ${entity.filingPeriod} is due on ${deadline.toDateString()}.`;
        break;

      case 'invoice':
        entity = await Invoice.findById(entityId).populate('clientId');
        if (!entity) return errorResponse(res, 404, 'Invoice not found');
        deadline = entity.dueDate;
        clientId = entity.clientId._id;
        title = `Payment Due Reminder`;
        message = `Your invoice for ${entity.serviceType} amounting ₹${entity.totalAmount} is due on ${deadline.toDateString()}.`;
        break;

      default:
        return errorResponse(res, 400, 'Invalid entity type');
    }

    const reminders = [];

    for (const days of reminderDays) {
      const reminderDate = new Date(deadline);
      reminderDate.setDate(reminderDate.getDate() - days);

      // Skip if reminder date is in the past
      if (reminderDate < new Date()) continue;

      const reminder = new Reminder({
        clientId,
        createdBy: req.userId,
        title,
        message: `${message} (${days} day${days > 1 ? 's' : ''} remaining)`,
        reminderType: 'deadline',
        reminderDate,
        priority: days <= 3 ? 'high' : 'medium',
        channels: ['email', 'sms'],
        relatedEntity: entityType,
        relatedEntityId: entityId,
      });

      await reminder.save();
      reminders.push(reminder);
    }

    return successResponse(res, 201, 'Automatic reminders created successfully', reminders);
  } catch (error) {
    next(error);
  }
};

// @desc    Send pending reminders (Cron job)
// @route   POST /api/reminders/send-pending
// @access  Private (System/Admin)
const sendPendingReminders = async (req, res, next) => {
  try {
    const now = new Date();
    const pendingReminders = await Reminder.find({
      status: 'scheduled',
      reminderDate: { $lte: now },
    }).populate('clientId', 'email phone firstName lastName');

    const sentReminders = [];

    for (const reminder of pendingReminders) {
      // In a real implementation, you would send email/SMS here
      // For now, just mark as sent
      reminder.status = 'sent';
      reminder.sentAt = now;
      reminder.deliveryStatus = 'delivered';
      await reminder.save();
      sentReminders.push(reminder);
    }

    return successResponse(res, 200, `${sentReminders.length} reminders sent successfully`, sentReminders);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReminder,
  getReminders,
  updateReminderStatus,
  createAutoReminders,
  sendPendingReminders,
};
