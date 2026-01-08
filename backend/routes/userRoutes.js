const express = require('express');
const router = express.Router();
const { register, login, createUser, listUsers, getUser, updateUser, deleteUser, verify } = require('../controllers/userController');
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');

// Public auth endpoints
router.post('/register', register);
router.post('/login', login);
// Verify token (used by frontend to confirm auth)
router.get('/verify', authMiddleware, verify);

// Admin and coordinator: create users (coordinator can only create 'user' accounts)
router.post('/', authMiddleware, requireRole('admin','superAdmin','coordinator'), createUser);
// List all users (admin only)
router.get('/', authMiddleware, requireRole('admin','superAdmin'), listUsers);
// New: authenticated endpoint to list contacts for chat (no admin role required)
router.get('/contacts', authMiddleware, (req, res, next) => {
  // forward to controller method if added
  return require('../controllers/userController').listContacts(req, res, next);
});

router.get('/:id', authMiddleware, getUser); // owner or admin enforced in controller
router.put('/:id', authMiddleware, updateUser); // owner or admin enforced in controller
router.delete('/:id', authMiddleware, requireRole('admin','superAdmin'), deleteUser);

module.exports = router;
