const express = require('express');
const router = express.Router();
const { getUserNotifications, markAsRead } = require('../controllers/notificationController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.get('/', authMiddleware, getUserNotifications);
router.post('/:id/read', authMiddleware, markAsRead);

module.exports = router;
