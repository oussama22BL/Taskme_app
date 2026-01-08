const express = require('express');
const router = express.Router();
const { hello } = require('../controllers/helloController');

router.get('/', hello);

module.exports = router;
