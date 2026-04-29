const path = require('path');
const Document = require('../models/Document');
const Assignment = require('../models/Assignment');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const { ERROR_MESSAGES, SUCCESS_MESSAGES } = require('../utils/constants');

// @desc    Upload document
// @route   POST /api/documents/upload
// @access  Private
const uploadDocument = async (req, res, next) => {
  try {
    const { month, category, notes } = req.body;

    if (!month || !category) {
      return errorResponse(res, 400, 'Month and category are required');
    }

    const filesArray = req.files && req.files.length ? req.files : req.file ? [req.file] : [];
    if (filesArray.length === 0) {
      return errorResponse(res, 400, 'Please upload at least one file');
    }

    const files = filesArray.map((file) => ({
      originalName: file.originalname,
      fileName: file.filename,
      filePath: file.path,
      fileSize: file.size,
      mimeType: file.mimetype,
    }));

    const document = new Document({
      userId: req.userId,
      month,
      category,
      notes,
      files,
    });

    await document.save();

    return successResponse(res, 201, SUCCESS_MESSAGES.DOCUMENT_UPLOADED, document);
  } catch (error) {
    return errorResponse(res, 500, error.message || 'Failed to upload document');
  }
};

// @desc    Get documents by user
// @route   GET /api/documents
// @access  Private
const getDocuments = async (req, res, next) => {
  try {
    const { status, category, month, page = 1, limit = 10 } = req.query;

    let query = {};
    if (req.userRole === 'accountant') {
      // Get assigned clients
      const assignments = await Assignment.find({ accountantId: req.userId });
      const clientIds = assignments.map((a) => a.clientId);
      query.userId = { $in: clientIds };
    } else {
      query.userId = req.userId;
    }

    if (status) query.status = status;
    if (category) query.category = category;
    if (month) query.month = month;

    const documents = await Document.find(query)
      .populate('userId', 'name email') // Populate user info for accountants
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Document.countDocuments(query);

    return successResponse(res, 200, 'Documents fetched successfully', {
      documents,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return errorResponse(res, 500, error.message || 'Failed to fetch documents');
  }
};

// @desc    Get single document
// @route   GET /api/documents/:documentId
// @access  Private
const getDocumentById = async (req, res, next) => {
  try {
    const { documentId } = req.params;

    const document = await Document.findById(documentId);

    if (!document) {
      return errorResponse(res, 404, ERROR_MESSAGES.NOT_FOUND);
    }

    // Check authorization
    if (document.userId.toString() !== req.userId.toString() && req.userRole === 'client') {
      return errorResponse(res, 403, ERROR_MESSAGES.FORBIDDEN);
    }

    return successResponse(res, 200, 'Document fetched successfully', document);
  } catch (error) {
    return errorResponse(res, 500, error.message || 'Failed to fetch document');
  }
};

// @desc    Review document (admin/accountant)
// @route   PUT /api/documents/:documentId/review
// @access  Private/Admin/Accountant
const reviewDocument = async (req, res, next) => {
  try {
    const { documentId } = req.params;
    const { status, reviewNotes } = req.body;

    if (!status) {
      return errorResponse(res, 400, 'Status is required');
    }

    const document = await Document.findById(documentId);

    if (!document) {
      return errorResponse(res, 404, ERROR_MESSAGES.NOT_FOUND);
    }

    // Check authorization
    if (req.userRole === 'client') {
      return errorResponse(res, 403, ERROR_MESSAGES.FORBIDDEN);
    } else if (req.userRole === 'accountant') {
      // Check if accountant is assigned to the client
      const assignment = await Assignment.findOne({ accountantId: req.userId, clientId: document.userId });
      if (!assignment) {
        return errorResponse(res, 403, ERROR_MESSAGES.FORBIDDEN);
      }
    }

    const updatedDocument = await Document.findByIdAndUpdate(
      documentId,
      {
        status,
        reviewNotes,
        reviewedBy: req.userId,
        reviewedAt: new Date(),
      },
      { new: true }
    );

    return successResponse(res, 200, 'Document reviewed successfully', updatedDocument);
  } catch (error) {
    return errorResponse(res, 500, error.message || 'Failed to review document');
  }
};

// @desc    Download document file
// @route   GET /api/documents/:documentId/download
// @access  Private
const downloadDocument = async (req, res, next) => {
  try {
    const { documentId } = req.params;
    const { fileIndex = 0 } = req.query;

    const document = await Document.findById(documentId);

    if (!document) {
      return errorResponse(res, 404, ERROR_MESSAGES.NOT_FOUND);
    }

    // Check authorization
    if (document.userId.toString() !== req.userId.toString() && req.userRole === 'client') {
      return errorResponse(res, 403, ERROR_MESSAGES.FORBIDDEN);
    }

    if (!document.files || document.files.length === 0) {
      return errorResponse(res, 400, 'No files associated with this document');
    }

    const file = document.files[fileIndex];
    if (!file) {
      return errorResponse(res, 400, 'Invalid file index');
    }

    const absolutePath = path.resolve(file.filePath);
    return res.download(absolutePath, file.originalName);
  } catch (error) {
    return errorResponse(res, 500, error.message || 'Failed to prepare download');
  }
};

// @desc    Delete document
// @route   DELETE /api/documents/:documentId
// @access  Private
const deleteDocument = async (req, res, next) => {
  try {
    const { documentId } = req.params;

    const document = await Document.findById(documentId);

    if (!document) {
      return errorResponse(res, 404, ERROR_MESSAGES.NOT_FOUND);
    }

    // Check authorization
    if (document.userId.toString() !== req.userId.toString() && req.userRole !== 'admin') {
      return errorResponse(res, 403, ERROR_MESSAGES.FORBIDDEN);
    }

    await Document.findByIdAndDelete(documentId);

    return successResponse(res, 200, 'Document deleted successfully');
  } catch (error) {
    return errorResponse(res, 500, error.message || 'Failed to delete document');
  }
};

module.exports = {
  uploadDocument,
  getDocuments,
  getDocument: getDocumentById,
  getDocumentById,
  downloadDocument,
  updateDocumentStatus: reviewDocument,
  reviewDocument,
  deleteDocument,
};
