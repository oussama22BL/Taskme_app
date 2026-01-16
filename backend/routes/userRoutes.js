const express = require('express');
const router = express.Router();
const { getUsers, createAccount, getAllUsers } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Route protégée : seuls les admins peuvent lister les utilisateurs
router.get('/', protect, authorize('admin', 'superAdmin'), getUsers);

router.post('/create-account', protect, authorize('superAdmin'), createAccount); // URL: /api/super-admin/create-account
router.get('/all', protect, authorize('superAdmin'), getAllUsers); 

module.exports = router;