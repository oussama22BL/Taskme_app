const User = require('../models/User');
const Assignment = require('../models/Assignment');
const Task = require('../models/Task');


//================Affectation semi automatisé================//

exports.findUserByTourDeRole = async (newTask) => {
    console.log("--- Début Algo Tour de Rôle ---");
    console.log("Critères Tâche :", { 
        specs: newTask.specialitesConcernees, 
        grades: newTask.gradesConcernes 
    });
    // 1. Filtrer les candidats par spécialité et grade
    let candidates = await User.find({
        specialite: { $in: newTask.specialitesConcernees },
        grade: { $in: newTask.gradesConcernes },
        isActive: true
    });

    if (candidates.length === 0) return null;

    let eligibleCandidates = [];

    // 2. Vérifier la disponibilité temporelle pour chaque candidat
    for (let user of candidates) {
        
        // Trouver TOUTES les affectations actives de cet utilisateur
        const activeAssignments = await Assignment.find({
            userId: user._id,
            statut: { $in: ['en_attente', 'acceptée'] }
        }).populate('taskId');

        let isBusy = false;

        for (let assignment of activeAssignments) {
            const existingTask = assignment.taskId;

            // Logique de collision de dates :
            // Il y a conflit si (Debut1 <= Fin2) ET (Fin1 >= Debut2)
            const hasOverlap = (newTask.dateDebut <= existingTask.dateFin && 
                                newTask.dateFin >= existingTask.dateDebut);

            if (hasOverlap) {
                isBusy = true;
                break; // Inutile de vérifier les autres tâches de cet utilisateur
            }
        }

        if (!isBusy) {
            eligibleCandidates.push(user);
        }
    }

    if (eligibleCandidates.length === 0) return null;

    // 3. Parmi ceux qui sont LIBRES, appliquer le Tour de Rôle
    // On prend celui qui a la "dernierAffection" la plus ancienne
    eligibleCandidates.sort((a, b) => {
        const dateA = a.dernierAffection ? new Date(a.dernierAffection).getTime() : 0;
        const dateB = b.dernierAffection ? new Date(b.dernierAffection).getTime() : 0;
        return dateA - dateB;
    });

    return eligibleCandidates[0];
};

//================Affectation automatisé par IA================//

exports.findUserByIA = async (newTask) => {
    // 1. Récupérer les candidats de base (Spécialité + Grade)
    let candidates = await User.find({
        specialite: { $in: newTask.specialitesConcernees },
        grade: { $in: newTask.gradesConcernes },
        isActive: true
    });

    if (candidates.length === 0) return null;

    let scoredCandidates = [];

    for (let user of candidates) {
        // --- CHECK DISPONIBILITÉ (Même logique que le Tour de Rôle) ---
        const activeAssignments = await Assignment.find({
            userId: user._id,
            statut: { $in: ['en_attente', 'acceptée'] }
        }).populate('taskId');

        let isBusy = false;
        for (let ass of activeAssignments) {
            if (newTask.dateDebut <= ass.taskId.dateFin && newTask.dateFin >= ass.taskId.dateDebut) {
                isBusy = true; break;
            }
        }
        if (isBusy) continue;

        // --- CALCUL DU SCORE IA (Simulation) ---
        let score = 0;

        // Critère 1 : Expérience sur ce type de tâche (Simulation IA via Historique)
        // On compte combien de missions de ce "type" l'utilisateur a déjà terminées
        const pastMissions = await Assignment.find({ 
            userId: user._id, 
            statut: 'acceptée' 
        }).populate('taskId');
        
        const experienceCount = pastMissions.filter(m => m.taskId.type === newTask.type).length;
        score += experienceCount * 10; // +10 points par mission similaire réussie

        // Critère 2 : Le Grade
        if (user.grade === 'A') score += 30;
        if (user.grade === 'B') score += 15;

        // Critère 3 : Spécialité principale
        if (user.specialite === newTask.specialitesConcernees[0]) score += 20;

        scoredCandidates.push({ user, score });
    }

    if (scoredCandidates.length === 0) return null;

    // Trier par score le plus élevé (Le meilleur expert en premier)
    scoredCandidates.sort((a, b) => b.score - a.score);

    return {
        user: scoredCandidates[0].user,
        score: scoredCandidates[0].score
    };
};