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
router.post('/', protect, authorize('admin'), createAssignment);
router.get('/', protect, authorize('admin', 'superAdmin'), getAssignments);
router.get('/history', protect, authorize('admin', 'superAdmin'), getAssignmentHistory);

// Routes Auditeur (User)
router.get('/my', protect, getMyAssignments);
router.put('/:id/respond', protect, respondToAssignment);

module.exports = router;