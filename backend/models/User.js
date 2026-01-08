const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    name: { type: String },
    nom: { type: String },
    prenom: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin', 'coordinator', 'superAdmin'], default: 'user' },
    specialite: { type: String },
    grade: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', UserSchema);
