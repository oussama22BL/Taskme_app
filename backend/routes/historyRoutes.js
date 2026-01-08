const express = require('express');
const router = express.Router();
const { getUserHistory } = require('../controllers/historyController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.get('/', authMiddleware, getUserHistory);

module.exports = router;
