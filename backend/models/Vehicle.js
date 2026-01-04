const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
    modele: { 
        type: String, 
        required: [true, "Le modèle est obligatoire"] 
    },
    immatriculation: { 
        type: String, 
        required: [true, "L'immatriculation est obligatoire"],
        unique: true 
    },
    disponibilite: { 
        type: Boolean, 
        default: true 
    },
    typeAttribution: { 
        type: String, 
        enum: ['individuelle', 'partagée'], 
        required: true 
    },
    directionActuelle: { 
        type: String,
        default: "Siège"
    }
}, { timestamps: true });

module.exports = mongoose.model('Vehicle', vehicleSchema);