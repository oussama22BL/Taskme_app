const express = require('express');
const router = express.Router();
const { addVehicle, getVehicles, updateVehicle, deleteVehicle } = require('../controllers/vehicleController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Route pour lister (accessible par tous les connectés)
router.get('/', protect, getVehicles);

// Routes de gestion (Admins uniquement)
router.post('/', protect, authorize('admin', 'superAdmin'), addVehicle);
router.put('/:id', protect, authorize('admin', 'superAdmin'), updateVehicle);
router.delete('/:id', protect, authorize('admin', 'superAdmin'), deleteVehicle);

module.exports = router;