const express = require('express');
const {
  createInvoice,
  getInvoices,
  updatePaymentStatus,
  generateInvoicePDF,
  getInvoiceStats,
} = require('../controllers/invoiceController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/invoices
// @desc    Create invoice
// @access  Private
router.post('/', authenticate, createInvoice);

// @route   GET /api/invoices
// @desc    Get invoices
// @access  Private
router.get('/', authenticate, getInvoices);

// @route   PUT /api/invoices/:invoiceId/payment
// @desc    Update payment status
// @access  Private
router.put('/:invoiceId/payment', authenticate, updatePaymentStatus);

// @route   GET /api/invoices/:invoiceId/pdf
// @desc    Generate invoice PDF
// @access  Private
router.get('/:invoiceId/pdf', authenticate, generateInvoicePDF);

// @route   GET /api/invoices/stats
// @desc    Get invoice statistics (Admin)
// @access  Private (Admin)
router.get('/stats/overview', authenticate, authorize('admin'), getInvoiceStats);

// Debug test route
router.get('/test', (req, res) => {
  res.send('Invoice routes working');
});

module.exports = router;
