const express = require('express');
const router = express.Router();
const { getMessagesByTask } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

// Protection globale
router.use(protect);

// GET /api/messages/:taskId (Où taskId peut être 'general' ou un ID MongoDB)
router.get('/:taskId', getMessagesByTask);

module.exports = router;