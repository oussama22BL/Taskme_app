const Vehicle = require('../models/Vehicle');

// @desc    Ajouter un nouveau véhicule
// @route   POST /api/vehicles
exports.addVehicle = async (req, res) => {
    try {
        const vehicle = await Vehicle.create(req.body);
        res.status(201).json(vehicle);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Récupérer les véhicules (avec filtre optionnel ?disponibilite=true)
// @route   GET /api/vehicles
exports.getVehicles = async (req, res) => {
    try {
        const { disponibilite } = req.query;
        const filter = {};
        if (disponibilite) filter.disponibilite = disponibilite === 'true';

        const vehicles = await Vehicle.find(filter);
        res.json(vehicles);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Mettre à jour la disponibilité (PATCH)
// @route   PATCH /api/vehicles/:id
exports.updateAvailability = async (req, res) => {
    try {
        const { disponibilite } = req.body;
        const vehicle = await Vehicle.findByIdAndUpdate(
            req.params.id, 
            { disponibilite }, 
            { new: true }
        );
        res.json(vehicle);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Supprimer un véhicule
// @route   DELETE /api/vehicles/:id
exports.deleteVehicle = async (req, res) => {
    try {
        await Vehicle.findByIdAndDelete(req.params.id);
        res.json({ message: "Véhicule supprimé avec succès" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @route   PUT /api/vehicles/:id
exports.updateVehicle = async (req, res) => {
    try {
        const vehicle = await Vehicle.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true, runValidators: true }
        );
        
        if (!vehicle) {
            return res.status(404).json({ message: "Véhicule non trouvé" });
        }
        
        res.json(vehicle);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};