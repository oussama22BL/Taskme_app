const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const messageController = require('../controllers/messageController');

// Get all conversations for the authenticated user
router.get('/conversations', authMiddleware, messageController.getConversations);

// Get messages for a specific conversation
router.get('/conversations/:conversationId', authMiddleware, messageController.getMessages);

// Create a message
router.post('/', authMiddleware, messageController.createMessage);

// Mark as read
router.post('/conversations/:conversationId/read', authMiddleware, messageController.markAsRead);

module.exports = router;