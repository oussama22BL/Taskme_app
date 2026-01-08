const express = require('express');
const router = express.Router();
const { getAll, create } = require('../controllers/taskController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.get('/', getAll);
// Create tasks requires authentication
router.post('/', authMiddleware, create);

module.exports = router;
