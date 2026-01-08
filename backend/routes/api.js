const express = require('express');
const router = express.Router();

// Mount other routers here (e.g., /users, /tasks)
router.get('/health', (req, res) => res.json({ status: 'ok' }));
const userRoutes = require('./userRoutes');
const taskRoutes = require('./taskRoutes');
const notificationRoutes = require('./notificationRoutes');
const historyRoutes = require('./historyRoutes');
const vehicleRoutes = require('./vehicleRoutes');
const messageRoutes = require('./messageRoutes');
const reportRoutes = require('./reportRoutes');

router.use('/users', userRoutes);
router.use('/tasks', taskRoutes);
router.use('/notifications', notificationRoutes);
router.use('/history', historyRoutes);
router.use('/vehicles', vehicleRoutes);
router.use('/messages', messageRoutes);
router.use('/reports', reportRoutes);

module.exports = router;
