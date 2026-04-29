const Filing = require('../models/Filing');
const Assignment = require('../models/Assignment');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const { ERROR_MESSAGES, SUCCESS_MESSAGES } = require('../utils/constants');

// @desc    Create filing
// @route   POST /api/filings
// @access  Private
const createFiling = async (req, res, next) => {
  try {
    const { assignmentId, filingType, filingPeriod, financialYear, notes } = req.body;

    if (!filingType || !filingPeriod || !financialYear) {
      return errorResponse(res, 400, 'Please provide all required fields');
    }

    let assignment = null;
    if (assignmentId) {
      assignment = await Assignment.findById(assignmentId);
      if (!assignment) {
        return errorResponse(res, 400, 'Invalid assignment ID');
      }
    }

    const filing = new Filing({
      clientId: req.userRole === 'client' ? req.userId : assignment?.clientId,
      accountantId: req.userRole === 'accountant' ? req.userId : assignment?.accountantId,
      assignmentId,
      filingType,
      filingPeriod,
      financialYear,
      notes,
    });

    await filing.save();

    return successResponse(res, 201, SUCCESS_MESSAGES.FILING_CREATED, filing);
  } catch (error) {
    next(error);
  }
};

// @desc    Get filings by user
// @route   GET /api/filings
// @access  Private
const getFilings = async (req, res, next) => {
  try {
    const { status, filingType, page = 1, limit = 10 } = req.query;

    let query = {};

    if (req.userRole === 'client') {
      query.clientId = req.userId;
    } else if (req.userRole === 'accountant') {
      query.accountantId = req.userId;
    } else if (req.userRole === 'admin') {
      // Admin can see all
    }

    if (status) query.status = status;
    if (filingType) query.filingType = filingType;

    const filings = await Filing.find(query)
      .populate('clientId', 'firstName lastName email businessName')
      .populate('accountantId', 'firstName lastName email specialization')
      .populate('assignmentId', 'serviceType deadline')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Filing.countDocuments(query);

    return successResponse(res, 200, 'Filings fetched successfully', {
      filings,
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

// @desc    Update filing status
// @route   PUT /api/filings/:filingId/status
// @access  Private
const updateFilingStatus = async (req, res, next) => {
  try {
    const { filingId } = req.params;
    const { status, rejectionReason, acknowledgementNumber, acknowledgementUrl } = req.body;

    const filing = await Filing.findById(filingId);

    if (!filing) {
      return errorResponse(res, 404, ERROR_MESSAGES.NOT_FOUND);
    }

    // Check authorization
    if (req.userRole === 'client' && filing.clientId.toString() !== req.userId.toString()) {
      return errorResponse(res, 403, ERROR_MESSAGES.FORBIDDEN);
    }

    if (req.userRole === 'accountant' && filing.accountantId.toString() !== req.userId.toString()) {
      return errorResponse(res, 403, ERROR_MESSAGES.FORBIDDEN);
    }

    if (status) filing.status = status;
    if (rejectionReason) filing.rejectionReason = rejectionReason;
    if (acknowledgementNumber) {
      filing.acknowledgementNumber = acknowledgementNumber;
      filing.acknowledgementReceived = true;
      filing.acknowledgementReceivedDate = new Date();
    }
    if (acknowledgementUrl) filing.acknowledgementDocument = acknowledgementUrl;

    await filing.save();

    return successResponse(res, 200, 'Filing updated successfully', filing);
  } catch (error) {
    next(error);
  }
};

// @desc    Upload filing documents
// @route   POST /api/filings/:filingId/documents
// @access  Private
const uploadFilingDocuments = async (req, res, next) => {
  try {
    const { filingId } = req.params;
    const { docType, docName } = req.body;

    if (!req.file) {
      return errorResponse(res, 400, 'Please upload a file');
    }

    const filing = await Filing.findById(filingId);

    if (!filing) {
      return errorResponse(res, 404, ERROR_MESSAGES.NOT_FOUND);
    }

    // Check authorization
    if (req.userRole === 'client' && filing.clientId.toString() !== req.userId.toString()) {
      return errorResponse(res, 403, ERROR_MESSAGES.FORBIDDEN);
    }

    if (req.userRole === 'accountant' && filing.accountantId.toString() !== req.userId.toString()) {
      return errorResponse(res, 403, ERROR_MESSAGES.FORBIDDEN);
    }

    filing.documents.push({
      docType,
      docName,
      filePath: req.file.path,
      uploadedAt: new Date(),
    });

    await filing.save();

    return successResponse(res, 200, 'Document uploaded successfully', filing.documents[filing.documents.length - 1]);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createFiling,
  getFilings,
  updateFilingStatus,
  uploadFilingDocuments,
};
