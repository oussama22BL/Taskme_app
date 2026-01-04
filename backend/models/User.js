const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    nom: { type: String, required: true },
    prenom: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { 
        type: String, 
        enum: ['superAdmin', 'admin', 'user'], 
        default: 'user' 
    },
    specialite: { 
        type: String, 
        enum: ['pédagogique', 'orientation', 'planification', 'financier'] 
    },
    grade: { 
        type: String, 
        enum: ['A', 'B', 'C'] 
    },
    anciennete: { type: Date },
    diplomes: [{ type: String }],
    formations: [{ type: String }],
    isActive: { type: Boolean, default: true },
    dernierAffection: { type: Date }
}, { timestamps: true });

// Middleware pour hacher le mot de passe avant de sauvegarder
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return ;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
   
});


userSchema.methods.comparePassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);