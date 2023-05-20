const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller')

// UC-101 Login 
router.post('/login', authController.login)

module.exports = router;