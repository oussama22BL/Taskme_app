const mongoose = require('mongoose');

const AssuranceSchema = new mongoose.Schema({
  numero: { type: String },
  dateExpiration: { type: Date },
  compagnie: { type: String }
}, { _id: false });

const VehicleSchema = new mongoose.Schema({
  matricule: { type: String, required: true, unique: true, trim: true },
  marque: { type: String, required: true, trim: true },
  modele: { type: String, required: true, trim: true },
  type: { type: String },
  carburant: { type: String },
  annee: { type: Number },
  kilometrage: { type: Number, default: 0 },
  couleur: { type: String },
  etat: { type: String, enum: ['disponible', 'en_mission', 'en_maintenance', 'hors_service'], default: 'disponible' },
  affectation: { type: String, enum: ['individuelle', 'partagee', 'direction'], default: 'individuelle' },
  affecteA: { type: String },
  affecteId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  dateAffectation: { type: Date },
  dateFinAffectation: { type: Date },
  disponibilite: { type: Boolean, default: true },
  assurance: { type: AssuranceSchema },
  dernierControle: { type: Date },
  prochainControle: { type: Date },
  capacite: { type: Number, default: 4 },
  options: { type: [String], default: [] },
  commentaires: { type: String }
}, { timestamps: true });

VehicleSchema.index({ matricule: 1 });

module.exports = mongoose.model('Vehicle', VehicleSchema);
