const cron = require('node-cron');
const Assignment = require('../models/Assignment');
const History = require('../models/History');
const Notification = require('../models/Notification');

const startCronJobs = (io) => {
    // Cette tâche s'exécute toutes les heures (0 * * * *)
    // Pour tester rapidement, vous pouvez mettre '* * * * *' (chaque minute)
    cron.schedule('0 * * * *', async () => {
        console.log("🔍 Vérification des affectations expirées (24h)...");

        try {
            const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

            // 1. Trouver les missions 'en_attente' créées il y a plus de 24h
            const expiredAssignments = await Assignment.find({
                statut: 'en_attente',
                createdAt: { $lte: twentyFourHoursAgo }
            }).populate('taskId');

            for (let assignment of expiredAssignments) {
                // 2. Passer le statut en 'acceptée' automatiquement
                assignment.statut = 'acceptée';
                assignment.dateReponse = Date.now();
                await assignment.save();

                // 3. Tracer l'action dans l'Historique
                await History.create({
                    action: 'ACCEPTATION_AUTOMATIQUE',
                    targetId: assignment._id,
                    targetType: 'Assignment',
                    performedBy: assignment.userId, // On l'attribue au système/user
                    details: "Acceptation automatique après 24h sans réponse."
                });

                // 4. Créer une notification pour l'utilisateur
                const notif = await Notification.create({
                    userId: assignment.userId,
                    message: `La tâche "${assignment.taskId.titre}" a été acceptée automatiquement (délai de 24h dépassé).`,
                    relatedId: assignment._id
                });

                // 5. Envoyer l'alerte en temps réel si l'user est connecté
                io.emit('new_notification', notif);
                
                console.log(`Mission ${assignment._id} acceptée automatiquement.`);
            }
        } catch (error) {
            console.error("Erreur dans le Cron Job :", error);
        }
    });
};

module.exports = startCronJobs;