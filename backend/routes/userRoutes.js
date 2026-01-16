const express = require('express');
const router = express.Router();
const { getUsers, createAccount, getAllUsers, toggleUserStatus, getUserProfile, updateUserProfile } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Route protégée : seuls les admins peuvent lister les utilisateurs
router.get('/', protect, authorize('admin', 'superAdmin'), getUsers);

router.post('/create-account', protect, authorize('superAdmin'), createAccount); // URL: /api/super-admin/create-account
router.get('/all', protect, authorize('superAdmin'), getAllUsers); 
router.patch('/:id/toggle-status', protect, authorize('superAdmin'), toggleUserStatus);

router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);

module.exports = router;