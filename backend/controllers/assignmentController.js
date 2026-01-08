const Assignment = require('../models/Assignment');
const Task = require('../models/Task');
const User = require('../models/User');
const Notification = require('../models/Notification'); // <--- NE PAS OUBLIER CET IMPORT
const History = require('../models/History');
const Vehicle = require('../models/Vehicle');
const { findUserByTourDeRole, findUserByIA } = require('../utils/assignmentAlgos');

exports.createAssignment = async (req, res) => {
    try {
        const { taskId, userId, mode, vehicleId } = req.body;

        // 1. Vérifier si la tâche existe
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ message: "Tâche non trouvée" });
        }

        let finalUserId = userId;
        let rapport = "Affectation manuelle effectuée par l'administrateur.";

        // 2. Gestion du mode Semi-Automatique (Algorithme Tour de Rôle)
        if (mode === 'semi-auto') {
            const chosenUser = await findUserByTourDeRole(task);
            if (!chosenUser || chosenUser.role !== 'auditeur') {
                return res.status(400).json({ 
                    message: "Aucun auditeur disponible (conflit d'horaire ou critères de spécialité/grade non remplis)" 
                });
            }
            finalUserId = chosenUser._id;
            rapport = `Choisi automatiquement par l'algorithme de Tour de Rôle. Dernier travail : ${chosenUser.dernierAffection || 'Aucun'}`;
        }

        // 3. Gestion du Véhicule (si la tâche en a besoin)
        if (task.besoinVehicule) {
            if (!vehicleId) {
                return res.status(400).json({ message: "Cette tâche nécessite un véhicule. Veuillez en sélectionner un." });
            }
            
            const vehicle = await Vehicle.findById(vehicleId);
            if (!vehicle || !vehicle.disponibilite) {
                return res.status(400).json({ message: "Le véhicule sélectionné n'est pas disponible." });
            }

            // Marquer le véhicule comme indisponible et mettre à jour sa direction
            await Vehicle.findByIdAndUpdate(vehicleId, { 
                disponibilite: false,
                directionActuelle: task.direction 
            });
        }

        // 4. Création de l'affectation dans la base de données
        const assignment = await Assignment.create({
            taskId,
            userId: finalUserId,
            vehicleId: task.besoinVehicule ? vehicleId : null,
            mode,
            rapportAlgorithme: rapport,
            statut: 'en_attente'
        });

        // 5. Mettre à jour la date de dernière affection de l'auditeur
        await User.findByIdAndUpdate(finalUserId, { dernierAffection: Date.now() });

        // 6. Enregistrement dans l'Historique global (Traçabilité)
        await History.create({
            action: 'AFFECTATION_CREEE',
            targetId: assignment._id,
            targetType: 'Assignment',
            performedBy: req.user._id, // L'admin connecté
            details: rapport
        });

        // 7. Création de la Notification pour l'auditeur
        const notif = await Notification.create({
            userId: finalUserId,
            message: `Nouvelle mission : ${task.titre}. Veuillez répondre sous 24h.`,
            relatedId: assignment._id
        });

        // 8. Envoi de la notification en temps réel via Socket.io
        // On émet vers l'utilisateur spécifique (ou globalement pour le test)
        if (req.io) {
            req.io.emit('new_notification', notif);
        }

        // 9. Réponse finale au client
        res.status(201).json({
            message: "Affectation créée avec succès",
            assignment
        });

    } catch (error) {
        console.error("Erreur lors de la création de l'affectation :", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};


// 1. Liste globale avec filtre (pour le Dashboard Admin)
exports.getAssignments = async (req, res) => {
    try {
        const { statut } = req.query;
        const filter = statut ? { statut } : {};
        const assignments = await Assignment.find(filter)
            .populate('taskId')
            .populate('userId', 'nom prenom email')
            .populate('vehicleId');
        res.json(assignments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



// @route   GET /api/assignments/my
exports.getMyAssignments = async (req, res) => {
    try {
        const assignments = await Assignment.find({ userId: req.user._id })
            .populate('taskId')
            .populate('vehicleId')
            .sort('-createdAt');
        res.json(assignments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// @route   PUT /api/assignments/:id/respond
exports.respondToAssignment = async (req, res) => {
    try {
        const { statut, justificatifRefus } = req.body; // 'acceptée' ou 'refusée'
        const assignment = await Assignment.findById(req.params.id);

        if (!assignment) return res.status(404).json({ message: "Affectation non trouvée" });

        // Vérifier que c'est bien l'utilisateur concerné qui répond
        if (assignment.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Non autorisé" });
        }

        assignment.statut = statut;
        if (statut === 'refusée') assignment.justificatifRefus = justificatifRefus;
        assignment.dateReponse = Date.now();
        await assignment.save();

        // --- ENREGISTRER DANS L'HISTORIQUE ---
        await History.create({
            action: statut === 'acceptée' ? 'MISSION_ACCEPTEE' : 'MISSION_REFUSEE',
            targetId: assignment._id,
            targetType: 'Assignment',
            performedBy: req.user._id,
            details: justificatifRefus || "Mission acceptée"
        });

        // --- NOTIFIER L'ADMIN VIA SOCKET ---
        req.io.emit('admin_notification', {
            message: `L'auditeur ${req.user.nom} a ${statut} la mission.`
        });

        res.json({ message: `Mission ${statut} avec succès`, assignment });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 3. Historique global (Traçabilité demandée au point 8)
exports.getAssignmentHistory = async (req, res) => {
    try {
        // On récupère les entrées de la table History liées aux assignments
        const History = require('../models/History');
        const history = await History.find({ targetType: 'Assignment' })
            .populate('performedBy', 'nom prenom role')
            .sort('-createdAt');
        res.json(history);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};