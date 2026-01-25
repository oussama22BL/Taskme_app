const Assignment = require('../models/Assignment');
const Task = require('../models/Task');
const User = require('../models/User');
const Notification = require('../models/Notification'); 
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

         console.log(`Mise à jour du statut de la tâche ${taskId} à 'en_cours'`);
         await Task.findByIdAndUpdate(taskId, { statut: 'en_cours' });
         console.log(`Statut de la tâche mis à jour avec succès`);

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


// Liste globale avec filtre (pour le Dashboard Admin)
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




exports.respondToAssignment = async (req, res) => {
    try {
        const { statut, justificatifRefus } = req.body;
        
        // 1. On récupère l'affectation en "peuplante" la tâche et le véhicule
        const assignment = await Assignment.findById(req.params.id)
            .populate('taskId')
            .populate('vehicleId');

        if (!assignment) return res.status(404).json({ message: "Affectation non trouvée" });

        // Vérification de sécurité (seul l'auditeur concerné peut répondre)
        if (assignment.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Non autorisé" });
        }

        // 2. LOGIQUE SI REFUS (Remarque prof : libérer véhicule + retour délégation)
        if (statut === 'refusée') {
            assignment.statut = 'refusée';
            assignment.justificatifRefus = justificatifRefus || "Refus manuel de l'auditeur";

            // a. Libérer le véhicule immédiatement si un véhicule était réservé
            if (assignment.vehicleId) {
                await Vehicle.findByIdAndUpdate(assignment.vehicleId._id, { disponibilite: true });
            }

            

            // b. Retour de délégation (Remarque prof : si refus, la tâche revient à l'initial)
            if (assignment.isDelegated && assignment.originalAssignment) {
                const original = await Assignment.findById(assignment.originalAssignment);
                if (original) {
                    original.statut = 'acceptée'; // Elle redevient active pour la personne de départ
                    await original.save();
                    
                    // Notifier l'auditeur initial du retour
                    await Notification.create({
                        userId: assignment.delegatedFrom,
                        message: `Votre délégation a été refusée. La mission vous a été réattribuée.`
                    });
                }
            }

            const otherActive = await Assignment.countDocuments({
                taskId: assignment.taskId._id,
                statut: { $in: ['en_attente', 'acceptée'] },
                _id: { $ne: assignment._id }
            });

            if (otherActive === 0) {
                // 🚨 Plus personne sur la mission : elle redevient "ouverte"
                await Task.findByIdAndUpdate(assignment.taskId._id, { statut: 'ouverte' });
            }
        } 

        // 3. LOGIQUE SI ACCEPTÉE (Remarque prof : gestion du quota d'auditeurs)
        else if (statut === 'acceptée') {
            assignment.statut = 'acceptée';
            
            const taskId = assignment.taskId._id;
            const maxPlaces = assignment.taskId.nombrePlaces || 1;

            // On compte combien de personnes ont déjà accepté cette mission
            const countAccepted = await Assignment.countDocuments({ taskId, statut: 'acceptée' });

            // Si on atteint le nombre maximum de places prévues
            if (countAccepted + 1 >= maxPlaces) {
                // On refuse automatiquement tous les autres auditeurs encore "en_attente"
                await Assignment.updateMany(
                    { taskId, statut: 'en_attente', _id: { $ne: assignment._id } },
                    { statut: 'refusée', justificatifRefus: "Quota d'auditeurs atteint (Mission complète)." }
                );
                // On ferme la tâche officiellement
                await Task.findByIdAndUpdate(taskId, { statut: 'clôturée' });
            } else {
                // Sinon on passe la tâche en cours
                await Task.findByIdAndUpdate(taskId, { statut: 'en_cours' });
            }
        }

        assignment.dateReponse = Date.now();
        await assignment.save();

        // 4. HISTORIQUE ET TRAÇABILITÉ (Point 8 du cahier des charges)
        await History.create({
            action: statut === 'acceptée' ? 'MISSION_ACCEPTEE' : 'MISSION_REFUSEE',
            targetId: assignment._id,
            targetType: 'Assignment',
            performedBy: req.user._id,
            details: statut === 'refusée' ? assignment.justificatifRefus : "Mission validée par l'auditeur."
        });

        // 5. SOCKETS (Notifications Admin)
        if (req.io) {
            req.io.emit('admin_notification', {
                message: `L'auditeur ${req.user.prenom} ${req.user.nom} a ${statut} la mission : ${assignment.taskId.titre}.`
            });
        }

        res.json({ message: `Mission ${statut} avec succès`, assignment });

    } catch (error) {
        console.error("Erreur respondToAssignment:", error);
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

//     Modifier une affectation (Changer d'auditeur ou de véhicule)
//    PUT /api/assignments/:id
exports.updateAssignment = async (req, res) => {
    try {
        const { userId, vehicleId } = req.body;
        const assignment = await Assignment.findById(req.params.id);
        
        if (!assignment) return res.status(404).json({ message: "Affectation non trouvée" });

        // 1. Si on change de véhicule, on libère l'ancien
        if (assignment.vehicleId && assignment.vehicleId.toString() !== vehicleId) {
            await Vehicle.findByIdAndUpdate(assignment.vehicleId, { disponibilite: true });
        }

        // 2. Vérification du nouveau véhicule (Disponibilité par période - Logique du prof)
        if (vehicleId) {
            const task = await Task.findById(assignment.taskId);
            const conflict = await Assignment.findOne({
                _id: { $ne: assignment._id },
                vehicleId: vehicleId,
                statut: 'acceptée'
            }).populate('taskId');

            if (conflict) {
                const hasOverlap = (new Date(task.dateDebut) <= new Date(conflict.taskId.dateFin) && 
                                    new Date(task.dateFin) >= new Date(conflict.taskId.dateDebut));
                if (hasOverlap) return res.status(400).json({ message: "Véhicule déjà réservé pour ces dates." });
            }
            await Vehicle.findByIdAndUpdate(vehicleId, { disponibilite: false });
        }

        assignment.userId = userId || assignment.userId;
        assignment.vehicleId = vehicleId || assignment.vehicleId;
        await assignment.save();

        res.json({ message: "Affectation mise à jour", assignment });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//     Supprimer une affectation (Annuler la mission pour cet auditeur)
exports.deleteAssignment = async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id);
        if (assignment.vehicleId) {
            await Vehicle.findByIdAndUpdate(assignment.vehicleId, { disponibilite: true });
        }
        await Assignment.findByIdAndDelete(req.params.id);
        res.json({ message: "Affectation annulée et véhicule libéré." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};