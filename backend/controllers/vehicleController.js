const Vehicle = require('../models/Vehicle');
const User = require('../models/User');

// GET /api/vehicles
const listVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find().sort({ createdAt: -1 });
    res.json(vehicles);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// GET /api/vehicles/available
const listAvailable = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ disponibilite: true });
    res.json(vehicles);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// GET /api/vehicles/:id
const getVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ msg: 'Vehicle not found' });
    res.json(vehicle);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// POST /api/vehicles (admin only)
const createVehicle = async (req, res) => {
  try {
    if (!(req.user.role === 'admin' || req.user.role === 'superAdmin')) return res.status(403).json({ msg: 'Forbidden' });

    const data = req.body;
    const exists = await Vehicle.findOne({ matricule: data.matricule });
    if (exists) return res.status(400).json({ msg: 'Matricule already exists' });
    const vehicle = new Vehicle(data);
    await vehicle.save();
    res.status(201).json(vehicle);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// PUT /api/vehicles/:id (admin only)
const updateVehicle = async (req, res) => {
  try {
    if (!(req.user.role === 'admin' || req.user.role === 'superAdmin')) return res.status(403).json({ msg: 'Forbidden' });

    const data = req.body;
    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!vehicle) return res.status(404).json({ msg: 'Vehicle not found' });
    res.json(vehicle);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// DELETE /api/vehicles/:id
const deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
    if (!vehicle) return res.status(404).json({ msg: 'Vehicle not found' });
    res.json({ msg: 'Vehicle deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// POST /api/vehicles/:id/assign
const assignVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, userId, dateDebut, dateFin, motif } = req.body;

    const vehicle = await Vehicle.findById(id);
    if (!vehicle) return res.status(404).json({ msg: 'Vehicle not found' });

    vehicle.affectation = type || vehicle.affectation;
    vehicle.disponibilite = false;
    vehicle.etat = 'en_mission';
    vehicle.dateAffectation = dateDebut ? new Date(dateDebut) : new Date();
    vehicle.dateFinAffectation = dateFin ? new Date(dateFin) : undefined;
    vehicle.commentaires = motif || vehicle.commentaires;

    if (userId) {
      const user = await User.findById(userId);
      if (user) {
        vehicle.affecteId = user._id;
        vehicle.affecteA = `${user.prenom || ''} ${user.nom || ''}`.trim();
      }
    }

    await vehicle.save();
    res.json(vehicle);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// POST /api/vehicles/:id/release
const releaseVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const vehicle = await Vehicle.findById(id);
    if (!vehicle) return res.status(404).json({ msg: 'Vehicle not found' });

    vehicle.etat = 'disponible';
    vehicle.disponibilite = true;
    vehicle.affecteA = undefined;
    vehicle.affecteId = undefined;
    vehicle.dateAffectation = undefined;
    vehicle.dateFinAffectation = undefined;

    await vehicle.save();
    res.json(vehicle);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

module.exports = {
  listVehicles,
  listAvailable,
  getVehicle,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  assignVehicle,
  releaseVehicle
};
