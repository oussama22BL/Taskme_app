const User = require('../models/User');
const Assignment = require('../models/Assignment');



//Affectation semi automatisé
exports.findUserByTourDeRole = async (newTask) => {
    
    let candidates = await User.find({
        role: 'user', 
        specialite: { $in: newTask.specialitesConcernees },
        grade: { $in: newTask.gradesConcernes },
        isActive: true
    });

    let eligibleList = [];

    for (let user of candidates) {
        const activeAss = await Assignment.find({
            userId: user._id,
            statut: { $in: ['en_attente', 'acceptée'] }
        }).populate('taskId');

        let isBusy = false;
        for (let ass of activeAss) {
            const existingTask = ass.taskId;
            const hasOverlap = (new Date(newTask.dateDebut) <= new Date(existingTask.dateFin) && 
                                new Date(newTask.dateFin) >= new Date(existingTask.dateDebut));
            if (hasOverlap) {
                isBusy = true;
                break;
            }
        }

        if (!isBusy) {
            eligibleList.push(user);
        }
    }

    // 3. Trier par "Tour de Rôle" (les plus anciens en premier)
    eligibleList.sort((a, b) => {
        const dateA = a.dernierAffection ? new Date(a.dernierAffection).getTime() : 0;
        const dateB = b.dernierAffection ? new Date(b.dernierAffection).getTime() : 0;
        return dateA - dateB;
    });

    return eligibleList; 

};

//Affectation automatisé par IA

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