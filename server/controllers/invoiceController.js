const Invoice = require('../models/Invoice');
const Assignment = require('../models/Assignment');
const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const { ERROR_MESSAGES, SUCCESS_MESSAGES } = require('../utils/constants');

// @desc    Create invoice
// @route   POST /api/invoices
// @access  Private
const createInvoice = async (req, res, next) => {
  try {
    const {
      assignmentId,
      clientId,
      serviceType,
      amount,
      gstRate = 18,
      description,
      dueDate,
    } = req.body;

    if (!clientId || !serviceType || !amount || !dueDate) {
      return errorResponse(res, 400, 'Please provide all required fields');
    }

    // Verify client exists
    const client = await User.findById(clientId);
    if (!client || client.role !== 'client') {
      return errorResponse(res, 400, 'Invalid client ID');
    }

    let assignment = null;
    if (assignmentId) {
      assignment = await Assignment.findById(assignmentId);
      if (!assignment) {
        return errorResponse(res, 400, 'Invalid assignment ID');
      }
    }

    // Calculate GST and total
    const gstAmount = (amount * gstRate) / 100;
    const totalAmount = amount + gstAmount;

    const invoice = new Invoice({
      clientId,
      accountantId: req.userRole === 'accountant' ? req.userId : assignment?.accountantId,
      assignmentId,
      serviceType,
      amount,
      gstRate,
      gstAmount,
      totalAmount,
      description,
      dueDate: new Date(dueDate),
    });

    await invoice.save();

    return successResponse(res, 201, SUCCESS_MESSAGES.INVOICE_CREATED, invoice);
  } catch (error) {
    next(error);
  }
};

// @desc    Get invoices
// @route   GET /api/invoices
// @access  Private
const getInvoices = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    let query = {};

    if (req.userRole === 'client') {
      query.clientId = req.userId;
    } else if (req.userRole === 'accountant') {
      query.accountantId = req.userId;
    } else if (req.userRole === 'admin') {
      // Admin can see all
    }

    if (status) query.status = status;

    const invoices = await Invoice.find(query)
      .populate('clientId', 'firstName lastName email businessName phone')
      .populate('accountantId', 'firstName lastName email specialization')
      .populate('assignmentId', 'serviceType deadline status')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Invoice.countDocuments(query);

    return successResponse(res, 200, 'Invoices fetched successfully', {
      invoices,
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

// @desc    Update payment status
// @route   PUT /api/invoices/:invoiceId/payment
// @access  Private
const updatePaymentStatus = async (req, res, next) => {
  try {
    const { invoiceId } = req.params;
    const { status, paymentMethod, transactionId, paymentDate, notes } = req.body;

    const invoice = await Invoice.findById(invoiceId);

    if (!invoice) {
      return errorResponse(res, 404, ERROR_MESSAGES.NOT_FOUND);
    }

    // Check authorization
    if (req.userRole === 'client' && invoice.clientId.toString() !== req.userId.toString()) {
      return errorResponse(res, 403, ERROR_MESSAGES.FORBIDDEN);
    }

    if (req.userRole === 'accountant' && invoice.accountantId.toString() !== req.userId.toString()) {
      return errorResponse(res, 403, ERROR_MESSAGES.FORBIDDEN);
    }

    if (status) invoice.status = status;
    if (paymentMethod) invoice.paymentMethod = paymentMethod;
    if (transactionId) invoice.transactionId = transactionId;
    if (paymentDate) invoice.paymentDate = new Date(paymentDate);
    if (notes) invoice.notes = notes;

    await invoice.save();

    return successResponse(res, 200, 'Payment status updated successfully', invoice);
  } catch (error) {
    next(error);
  }
};

// @desc    Generate invoice PDF (placeholder)
// @route   GET /api/invoices/:invoiceId/pdf
// @access  Private
const generateInvoicePDF = async (req, res, next) => {
  try {
    const { invoiceId } = req.params;

    const invoice = await Invoice.findById(invoiceId)
      .populate('clientId', 'firstName lastName email businessName address phone gstNumber')
      .populate('accountantId', 'firstName lastName email businessName address phone gstNumber')
      .populate('assignmentId', 'serviceType deadline');

    if (!invoice) {
      return errorResponse(res, 404, ERROR_MESSAGES.NOT_FOUND);
    }

    // Check authorization
    if (req.userRole === 'client' && invoice.clientId.toString() !== req.userId.toString()) {
      return errorResponse(res, 403, ERROR_MESSAGES.FORBIDDEN);
    }

    if (req.userRole === 'accountant' && invoice.accountantId.toString() !== req.userId.toString()) {
      return errorResponse(res, 403, ERROR_MESSAGES.FORBIDDEN);
    }

    // In a real implementation, you would generate a PDF here
    // For now, return the invoice data
    return successResponse(res, 200, 'Invoice data retrieved for PDF generation', invoice);
  } catch (error) {
    next(error);
  }
};

// @desc    Get invoice statistics (Admin)
// @route   GET /api/invoices/stats
// @access  Private (Admin)
const getInvoiceStats = async (req, res, next) => {
  try {
    const stats = await Invoice.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' },
        },
      },
    ]);

    const totalInvoices = await Invoice.countDocuments();
    const paidInvoices = await Invoice.countDocuments({ status: 'paid' });
    const pendingInvoices = await Invoice.countDocuments({ status: 'pending' });
    const overdueInvoices = await Invoice.countDocuments({
      status: 'pending',
      dueDate: { $lt: new Date() },
    });

    const totalRevenue = await Invoice.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);

    return successResponse(res, 200, 'Invoice statistics fetched successfully', {
      totalInvoices,
      paidInvoices,
      pendingInvoices,
      overdueInvoices,
      totalRevenue: totalRevenue[0]?.total || 0,
      statusBreakdown: stats,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createInvoice,
  getInvoices,
  updatePaymentStatus,
  generateInvoicePDF,
  getInvoiceStats,
};
