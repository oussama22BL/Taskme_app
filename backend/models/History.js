const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
    action: { type: String, required: true }, // AFFECTATION_CREEE, MISSION_ACCEPTEE, MISSION_REFUSEE
    targetId: { type: mongoose.Schema.Types.ObjectId, required: true }, // ID de la tâche ou de l'affectation
    targetType: { type: String, enum: ['Task', 'Assignment'], required: true },
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    details: { type: String }, // Ex: "Refus pour motif de santé"
}, { timestamps: true });

module.exports = mongoose.model('History', historySchema);