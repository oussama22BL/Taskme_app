const express = require('express');
const router = express.Router();
const { 
    getNotifications, 
    markAsRead, 
    markAllAsRead 
} = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

// Toutes les routes de notifications nécessitent d'être connecté
router.use(protect); 

// GET /api/notifications
router.get('/', getNotifications);

// PATCH /api/notifications/read-all (A mettre avant la route avec :id)
router.patch('/read-all', markAllAsRead);

// PATCH /api/notifications/:id/read
router.patch('/:id/read', markAsRead);

module.exports = router;