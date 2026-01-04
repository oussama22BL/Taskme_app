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

// @desc    Récupérer tous les véhicules
// @route   GET /api/vehicles
exports.getVehicles = async (req, res) => {
    try {
        const vehicles = await Vehicle.find();
        res.json(vehicles);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Mettre à jour un véhicule (ex: changer direction ou disponibilité)
// @route   PUT /api/vehicles/:id
exports.updateVehicle = async (req, res) => {
    try {
        const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!vehicle) return res.status(404).json({ message: "Véhicule non trouvé" });
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