const express = require('express');
const router = express.Router();
const { 
    getMessagesByTask 
} = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

// Toutes les routes de messages nécessitent d'être connecté
router.use(protect);
// GET /api/messages/task/:taskId

router.get('/:taskId', protect, async (req, res) => {
    const { taskId } = req.params;
    const filter = taskId === 'general' ? { taskId: null } : { taskId: taskId };
    
    const messages = await Message.find(filter)
        .populate('sender', 'nom prenom')
        .sort('createdAt'); // Du plus ancien au plus récent
    res.json(messages);
});
module.exports = router;