const express = require('express');
const router = express.Router();
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');
const vehicleController = require('../controllers/vehicleController');

// Public: list and get
router.get('/', vehicleController.listVehicles);
router.get('/available', vehicleController.listAvailable);
router.get('/:id', vehicleController.getVehicle);

// Protected: create / update / delete (require admin or superAdmin)
router.post('/', authMiddleware, requireRole('admin', 'superAdmin'), vehicleController.createVehicle);
router.put('/:id', authMiddleware, requireRole('admin', 'superAdmin'), vehicleController.updateVehicle);
router.delete('/:id', authMiddleware, requireRole('admin', 'superAdmin'), vehicleController.deleteVehicle);

// Assign / release (require authenticated user)
router.post('/:id/assign', authMiddleware, vehicleController.assignVehicle);
router.post('/:id/release', authMiddleware, vehicleController.releaseVehicle);

module.exports = router;
