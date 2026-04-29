const express = require('express');
const {
  createFiling,
  getFilings,
  updateFilingStatus,
  uploadFilingDocuments,
} = require('../controllers/filingController');
const { authenticate } = require('../middleware/auth');
const upload = require('../middleware/multer');

const router = express.Router();

// @route   POST /api/filings
// @desc    Create filing
// @access  Private
router.post('/', authenticate, createFiling);

// @route   GET /api/filings
// @desc    Get filings
// @access  Private
router.get('/', authenticate, getFilings);

// @route   PUT /api/filings/:filingId/status
// @desc    Update filing status
// @access  Private
router.put('/:filingId/status', authenticate, updateFilingStatus);

// @route   POST /api/filings/:filingId/documents
// @desc    Upload filing documents
// @access  Private
router.post('/:filingId/documents', authenticate, upload.single('document'), uploadFilingDocuments);

// Debug test route
router.get('/test', (req, res) => {
  res.send('Filing routes working');
});

module.exports = router;
