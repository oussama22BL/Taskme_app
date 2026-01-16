const Task = require('../models/Task');
const Assignment = require('../models/Assignment');
const Vehicle = require('../models/Vehicle');
const mongoose = require('mongoose');
const History = require('../models/History');


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


//    Récupérer toutes les tâches
//   GET /api/tasks
exports.getTasks = async (req, res) => {
    try {
        // .populate est sensible. Si 'createdBy' n'existe pas dans le schéma, ça crash.
        const tasks = await Task.find()
            .populate('createdBy', 'nom prenom') // On ne prend que nom/prenom
            .sort('-createdAt'); // Les plus récentes en premier
        
        res.status(200).json(tasks);
    } catch (error) {
        console.error("Erreur GET /tasks :", error.message);
        res.status(500).json({ message: "Erreur lors de la récupération des tâches" });
    }
};

//     Récupérer une tâche par ID
//   GET /api/tasks/:id
exports.getTaskById = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Vérifier si l'ID est au format valide MongoDB (évite le crash cast error)
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Format d'identifiant invalide" });
        }

        const task = await Task.findById(id).populate('createdBy', 'nom prenom');

        // 2. Si la tâche n'existe pas en DB
        if (!task) {
            return res.status(404).json({ message: "Tâche introuvable en base de données" });
        }

        res.status(200).json(task);
    } catch (error) {
        console.error("Erreur GET /tasks/:id :", error.message);
        res.status(500).json({ message: "Erreur serveur" });
    }
};




//    Supprimer une tâche et nettoyer les données liées
//    DELETE /api/tasks/:id
exports.deleteTask = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Vérifier si l'ID est valide
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "ID de tâche invalide" });
        }

        // 2. Trouver la tâche
        const task = await Task.findById(id);
        if (!task) {
            return res.status(404).json({ message: "Tâche non trouvée" });
        }

        // --- NETTOYAGE LOGISTIQUE ---

        // 3. Trouver toutes les affectations liées à cette tâche
        const linkedAssignments = await Assignment.find({ taskId: id });

        // 4. Si une affectation avait un véhicule, on le libère
        for (let assignment of linkedAssignments) {
            if (assignment.vehicleId) {
                await Vehicle.findByIdAndUpdate(assignment.vehicleId, { 
                    disponibilite: true,
                    directionActuelle: "Retour au parc (Tâche supprimée)" 
                });
            }
        }

        // 5. Supprimer toutes les affectations liées
        await Assignment.deleteMany({ taskId: id });

        // 6. Supprimer la tâche elle-même
        await Task.findByIdAndDelete(id);

        res.status(200).json({ 
            message: "Tâche et affectations liées supprimées avec succès. Véhicules libérés." 
        });

    } catch (error) {
        console.error("Erreur suppression tâche :", error);
        res.status(500).json({ message: "Erreur serveur lors de la suppression" });
    }
};


//    Modifier une tâche (Mise à jour complète)
//   PUT /api/tasks/:id
exports.updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        
        // 1. Récupérer la tâche actuelle
        let task = await Task.findById(id);
        if (!task) return res.status(404).json({ message: "Tâche non trouvée" });

        // 2. Préparer les données (on extrait du req.body car c'est du FormData)
        const { 
            titre, description, type, dateDebut, dateFin, 
            direction, besoinVehicule, specialitesConcernees, gradesConcernes 
        } = req.body;

        // 3. VALIDATION DES DATES (Remarque du prof)
        if (dateDebut && dateFin && new Date(dateDebut) > new Date(dateFin)) {
            return res.status(400).json({ message: "La date de début ne peut pas être après la date de fin." });
        }

        // 4. GESTION DU PDF (Si un nouveau fichier est téléchargé)
        let fichierPath = task.fichierJoint;
        if (req.file) {
            fichierPath = req.file.path; // On remplace par le nouveau chemin
        }

        // 5. TRAITEMENT DES TABLEAUX (Spécialités/Grades)
        // Multer/FormData transforme parfois les tableaux en chaînes JSON
        const parseArray = (data) => {
            if (typeof data === 'string') {
                try { return JSON.parse(data); } catch (e) { return data.split(','); }
            }
            return data;
        };

        // 6. MISE À JOUR
        const updatedFields = {
            titre: titre || task.titre,
            description: description || task.description,
            type: type || task.type,
            dateDebut: dateDebut || task.dateDebut,
            dateFin: dateFin || task.dateFin,
            direction: direction || task.direction,
            besoinVehicule: besoinVehicule === 'true' || besoinVehicule === true,
            fichierJoint: fichierPath,
            specialitesConcernees: specialitesConcernees ? parseArray(specialitesConcernees) : task.specialitesConcernees,
            gradesConcernes: gradesConcernes ? parseArray(gradesConcernes) : task.gradesConcernes
        };

        task = await Task.findByIdAndUpdate(id, updatedFields, { new: true, runValidators: true });

        // 7. HISTORIQUE (Traçabilité point 8)
        await History.create({
            action: 'TACHE_MODIFIEE',
            targetId: task._id,
            targetType: 'Task',
            performedBy: req.user._id,
            details: `Mise à jour des informations de la mission : ${task.titre}`
        });

        res.status(200).json(task);

    } catch (error) {
        console.error("Erreur updateTask:", error);
        res.status(500).json({ message: "Erreur lors de la modification", error: error.message });
    }
};