const express = require('express');
const {
  uploadDocument,
  getDocuments,
  getDocument,
  downloadDocument,
  updateDocumentStatus,
  deleteDocument,
} = require('../controllers/documentController');
const { authenticate } = require('../middleware/auth');
const upload = require('../middleware/multer');

const router = express.Router();

// @route   POST /api/documents
// @desc    Upload document
// @access  Private
router.post('/', authenticate, upload.array('documents', 20), uploadDocument);

// @route   GET /api/documents
// @desc    Get documents
// @access  Private
router.get('/', authenticate, getDocuments);

// @route   GET /api/documents/:documentId
// @desc    Get single document
// @access  Private
router.get('/:documentId', authenticate, getDocument);

// @route   GET /api/documents/:documentId/download
// @desc    Download document
// @access  Private
router.get('/:documentId/download', authenticate, downloadDocument);

// @route   PUT /api/documents/:documentId/status
// @desc    Update document status
// @access  Private
router.put('/:documentId/status', authenticate, updateDocumentStatus);

// @route   DELETE /api/documents/:documentId
// @desc    Delete document
// @access  Private
router.delete('/:documentId', authenticate, deleteDocument);

// Debug test route
router.get('/test', (req, res) => {
  res.send('Document routes working');
});

module.exports = router;
