const express = require('express');
const router = express.Router();
const { createTask, getTasks, getTaskById, deleteTask, updateTask } = require('../controllers/taskController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const mongoose = require('mongoose');

// Route pour créer une tâche (Seuls les admins + gestion du fichier PDF)
router.post('/', protect, authorize('admin', 'superAdmin'), upload.single('pdf'), createTask);
router.delete('/:id', protect, authorize('admin', 'superAdmin'), deleteTask);

// Route pour voir toutes les tâches (Tous les utilisateurs connectés)
router.get('/', protect, getTasks);

// Route pour voir une tâche précise
router.get('/:id', protect, getTaskById);

router.put('/:id', 
    protect, 
    authorize('admin', 'superAdmin'), 
    upload.single('pdf'), 
    updateTask
);

module.exports = router;