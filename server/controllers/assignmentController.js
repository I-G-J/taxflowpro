const Assignment = require('../models/Assignment');
const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const { ERROR_MESSAGES, SUCCESS_MESSAGES } = require('../utils/constants');

// @desc    Create assignment (Admin only)
// @route   POST /api/assignments
// @access  Private (Admin)
const createAssignment = async (req, res, next) => {
  try {
    const { clientId, accountantId, serviceType, deadline, priority, notes } = req.body;

    if (!clientId || !accountantId || !serviceType || !deadline) {
      return errorResponse(res, 400, 'Please provide all required fields');
    }

    // Verify client exists and is a client
    const client = await User.findById(clientId);
    if (!client || client.role !== 'client') {
      return errorResponse(res, 400, 'Invalid client ID');
    }

    // Verify accountant exists and is an accountant
    const accountant = await User.findById(accountantId);
    if (!accountant || accountant.role !== 'accountant') {
      return errorResponse(res, 400, 'Invalid accountant ID');
    }

    // Check if assignment already exists for this client and service type
    const existingAssignment = await Assignment.findOne({
      clientId,
      serviceType,
      status: { $in: ['assigned', 'in_progress'] },
    });

    if (existingAssignment) {
      return errorResponse(res, 400, 'Active assignment already exists for this service type');
    }

    const assignment = new Assignment({
      clientId,
      accountantId,
      serviceType,
      deadline: new Date(deadline),
      priority: priority || 'medium',
      notes,
      assignedBy: req.userId,
    });

    await assignment.save();

    return successResponse(res, 201, SUCCESS_MESSAGES.ASSIGNMENT_CREATED, assignment);
  } catch (error) {
    next(error);
  }
};

// @desc    Get assignments
// @route   GET /api/assignments
// @access  Private
const getAssignments = async (req, res, next) => {
  try {
    const { status, serviceType, page = 1, limit = 10 } = req.query;

    let query = {};

    if (req.userRole === 'client') {
      query.clientId = req.userId;
    } else if (req.userRole === 'accountant') {
      query.accountantId = req.userId;
    } else if (req.userRole === 'admin') {
      // Admin can see all
    }

    if (status) query.status = status;
    if (serviceType) query.serviceType = serviceType;

    const assignments = await Assignment.find(query)
      .populate('clientId', 'firstName lastName email businessName phone businessType kycStatus kycDocuments')
      .populate('accountantId', 'firstName lastName email specialization phone')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Assignment.countDocuments(query);

    return successResponse(res, 200, 'Assignments fetched successfully', {
      assignments,
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

// @desc    Update assignment status
// @route   PUT /api/assignments/:assignmentId/status
// @access  Private
const updateAssignmentStatus = async (req, res, next) => {
  try {
    const { assignmentId } = req.params;
    const { status, progressNotes, completionDate } = req.body;

    const assignment = await Assignment.findById(assignmentId);

    if (!assignment) {
      return errorResponse(res, 404, ERROR_MESSAGES.NOT_FOUND);
    }

    // Check authorization
    if (req.userRole === 'client' && assignment.clientId.toString() !== req.userId.toString()) {
      return errorResponse(res, 403, ERROR_MESSAGES.FORBIDDEN);
    }

    if (req.userRole === 'accountant' && assignment.accountantId.toString() !== req.userId.toString()) {
      return errorResponse(res, 403, ERROR_MESSAGES.FORBIDDEN);
    }

    if (status) assignment.status = status;
    if (progressNotes) assignment.progressNotes = progressNotes;
    if (completionDate) assignment.completionDate = new Date(completionDate);

    await assignment.save();

    return successResponse(res, 200, 'Assignment updated successfully', assignment);
  } catch (error) {
    next(error);
  }
};

// @desc    Reassign accountant (Admin only)
// @route   PUT /api/assignments/:assignmentId/reassign
// @access  Private (Admin)
const reassignAccountant = async (req, res, next) => {
  try {
    const { assignmentId } = req.params;
    const { newAccountantId, reason } = req.body;

    if (!newAccountantId) {
      return errorResponse(res, 400, 'New accountant ID is required');
    }

    const assignment = await Assignment.findById(assignmentId);

    if (!assignment) {
      return errorResponse(res, 404, ERROR_MESSAGES.NOT_FOUND);
    }

    // Verify new accountant exists and is an accountant
    const newAccountant = await User.findById(newAccountantId);
    if (!newAccountant || newAccountant.role !== 'accountant') {
      return errorResponse(res, 400, 'Invalid accountant ID');
    }

    const previousAccountantId = assignment.accountantId;

    assignment.accountantId = newAccountantId;
    assignment.status = 'assigned';
    assignment.isDeassigned = false;
    assignment.reassignReason = reason;
    assignment.reassignedAt = new Date();

    await assignment.save();

    return successResponse(res, 200, 'Accountant reassigned successfully', assignment);
  } catch (error) {
    next(error);
  }
};

// @desc    Deassign accountant from assignment (Admin only)
// @route   PUT /api/assignments/:assignmentId/deassign
// @access  Private (Admin)
const deassignAccountant = async (req, res, next) => {
  try {
    const { assignmentId } = req.params;
    const { reason } = req.body;

    const assignment = await Assignment.findById(assignmentId);

    if (!assignment) {
      return errorResponse(res, 404, ERROR_MESSAGES.NOT_FOUND);
    }

    if (assignment.status === 'completed' || assignment.status === 'cancelled') {
      return errorResponse(res, 400, 'Only active assignments can be deassigned');
    }

    assignment.status = 'cancelled';
    assignment.isDeassigned = true;
    assignment.deassignedAt = new Date();
    assignment.deassignedBy = req.userId;
    assignment.deassignReason = reason;

    await assignment.save();

    return successResponse(res, 200, 'Accountant deassigned successfully', assignment);
  } catch (error) {
    next(error);
  }
};

// @desc    Get assignment statistics (Admin)
// @route   GET /api/assignments/stats
// @access  Private (Admin)
const getAssignmentStats = async (req, res, next) => {
  try {
    const stats = await Assignment.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const totalAssignments = await Assignment.countDocuments();
    const activeAssignments = await Assignment.countDocuments({
      status: { $in: ['assigned', 'in_progress'] },
    });
    const completedAssignments = await Assignment.countDocuments({
      status: 'completed',
    });

    const assignedAccountantIds = await Assignment.distinct('accountantId', {
      status: { $in: ['assigned', 'in_progress'] },
    });
    const totalAccountants = await User.countDocuments({ role: 'accountant' });
    const freeAccountants = totalAccountants - assignedAccountantIds.length;

    return successResponse(res, 200, 'Assignment statistics fetched successfully', {
      totalAssignments,
      activeAssignments,
      completedAssignments,
      totalAccountants,
      freeAccountants,
      statusBreakdown: stats,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAssignment,
  getAssignments,
  updateAssignmentStatus,
  reassignAccountant,
  deassignAccountant,
  getAssignmentStats,
};
