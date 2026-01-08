const express = require('express');
const router = express.Router();
const { 
    createAssignment, 
    getMyAssignments, 
    respondToAssignment, 
    getAssignments, 
    getAssignmentHistory
} = require('../controllers/assignmentController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Routes Admin
router.post('/', protect, authorize('admin', 'superAdmin'), createAssignment);
router.get('/', protect, authorize('admin'), getAssignments);
router.get('/history', protect, authorize('admin'), getAssignmentHistory);

// Routes Auditeur (User)
router.get('/my', protect, getMyAssignments);
router.put('/:id/respond', protect, respondToAssignment);

module.exports = router;