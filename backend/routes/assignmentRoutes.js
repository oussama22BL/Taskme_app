const express = require('express');
const router = express.Router();
const { 
    createAssignment, 
    getMyAssignments, 
    respondToAssignment 
} = require('../controllers/assignmentController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Routes Admin
router.post('/', protect, authorize('admin', 'superAdmin'), createAssignment);

// Routes Auditeur (User)
router.get('/my', protect, getMyAssignments);
router.put('/:id/respond', protect, respondToAssignment);

module.exports = router;