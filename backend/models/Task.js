const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    titre: { type: String, required: true },
    description: { type: String },
    type: { 
        type: String, 
        enum: ['Formateur', 'Jury', 'Bénéficiaire', 'Observateur', 'Concepteur'],
        required: true
    },
    dateDebut: { type: Date, required: true },
    dateFin: { type: Date, required: true },
    isRemuneree: { type: Boolean, default: false },
    isCommune: { type: Boolean, default: false }, // si true, plusieurs spécialités possibles
    specialitesConcernees: [{ type: String }],
    gradesConcernes: [{ type: String }],
    besoinVehicule: { type: Boolean, default: false },
    direction: { 
        type: String, 
        enum: ['Rabat-Casa', 'Meknès-Errachidia', 'Marrakech-Agadir'] 
    },
    fichierJoint: { type: String , default: null}, // URL du PDF (Multer)
    nombrePlaces: { type: Number, default: 1 },
    statut: { 
        type: String, 
        enum: ['ouverte', 'en_cours', 'clôturée'], 
        default: 'ouverte' 
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);