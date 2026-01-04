const express = require('express');
const router = express.Router();
const { createTask, getTasks, getTaskById } = require('../controllers/taskController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Route pour créer une tâche (Seuls les admins + gestion du fichier PDF)
router.post('/', protect, authorize('admin', 'superAdmin'), upload.single('pdf'), createTask);

// Route pour voir toutes les tâches (Tous les utilisateurs connectés)
router.get('/', protect, getTasks);

// Route pour voir une tâche précise
router.get('/:id', protect, getTaskById);

module.exports = router;