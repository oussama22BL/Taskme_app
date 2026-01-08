const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    type: { type: String },
    dateDebut: { type: Date },
    dateFin: { type: Date },
    isRemuneree: { type: Boolean, default: false },
    isCommune: { type: Boolean, default: false },
    specialitesConcernees: [{ type: String }],
    gradesConcernes: [{ type: String }],
    besoinVehicule: { type: Boolean, default: false },
    direction: { type: String },
    fichierJoint: { type: String },
    nombrePlaces: { type: Number, default: 1 },
    status: { type: String, enum: ['ouverte','en_cours','clôturée','affectée','acceptée','refusée','déléguée'], default: 'ouverte' },
    assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Task', TaskSchema);
