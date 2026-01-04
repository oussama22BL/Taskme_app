const Task = require('../models/Task');

// @desc    Créer une nouvelle tâche
// @route   POST /api/tasks
exports.createTask = async (req, res) => {
    try {
        const taskData = req.body;
        
        // Ajouter l'ID de l'admin qui crée la tâche
        taskData.createdBy = req.user._id;

        // Si un fichier a été uploadé, on enregistre son chemin
        if (req.file) {
            taskData.fichierJoint = req.file.path;
        }

        const task = await Task.create(taskData);
        res.status(201).json(task);
    } catch (error) {
        res.status(400).json({ message: "Erreur lors de la création", error: error.message });
    }
};

// @desc    Récupérer toutes les tâches
// @route   GET /api/tasks
exports.getTasks = async (req, res) => {
    try {
        const tasks = await Task.find().populate('createdBy', 'nom prenom');
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur" });
    }
};

// @desc    Récupérer une tâche par ID
// @route   GET /api/tasks/:id
exports.getTaskById = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: "Tâche non trouvée" });
        res.json(task);
    } catch (error) {
        res.status(500).json({ message: "ID invalide" });
    }
};