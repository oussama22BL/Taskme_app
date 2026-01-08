const express = require('express');
const router = express.Router();
const { getUsers } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Route protégée : seuls les admins peuvent lister les utilisateurs
router.get('/', protect, authorize('admin', 'superAdmin'), getUsers);

module.exports = router;