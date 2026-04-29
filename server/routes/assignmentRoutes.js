const express = require('express');
const {
  createAssignment,
  getAssignments,
  updateAssignmentStatus,
  reassignAccountant,
  deassignAccountant,
  getAssignmentStats,
} = require('../controllers/assignmentController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/assignments
// @desc    Create assignment (Admin only)
// @access  Private (Admin)
router.post('/', authenticate, authorize('admin'), createAssignment);

// @route   GET /api/assignments
// @desc    Get assignments
// @access  Private
router.get('/', authenticate, getAssignments);

// @route   PUT /api/assignments/:assignmentId/status
// @desc    Update assignment status
// @access  Private
router.put('/:assignmentId/status', authenticate, updateAssignmentStatus);

// @route   PUT /api/assignments/:assignmentId/reassign
// @desc    Reassign accountant (Admin only)
// @access  Private (Admin)
router.put('/:assignmentId/reassign', authenticate, authorize('admin'), reassignAccountant);

// @route   PUT /api/assignments/:assignmentId/deassign
// @desc    Deassign accountant from assignment (Admin only)
// @access  Private (Admin)
router.put('/:assignmentId/deassign', authenticate, authorize('admin'), deassignAccountant);

// @route   GET /api/assignments/stats
// @desc    Get assignment statistics (Admin)
// @access  Private (Admin)
router.get('/stats/overview', authenticate, authorize('admin'), getAssignmentStats);

// Debug test route
router.get('/test', (req, res) => {
  res.send('Assignment routes working');
});

module.exports = router;
