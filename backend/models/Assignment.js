const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
    taskId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Task', 
        required: true 
    },
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    mode: { 
        type: String, 
        enum: ['manuel', 'semi-auto', 'ia'], 
        required: true 
    },
    statut: { 
        type: String, 
        enum: ['en_attente', 'acceptée', 'refusée', 'déléguée'], 
        default: 'en_attente' 
    },
    justificatifRefus: { type: String },
    dateAffectation: { type: Date, default: Date.now },
    dateReponse: { type: Date },
    rapportAlgorithme: { type: String }, // Explication du choix (IA/Tour de rôle)
    delegueA: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    },
    vehicleId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Vehicle' 
    }
}, { timestamps: true });

module.exports = mongoose.model('Assignment', assignmentSchema);