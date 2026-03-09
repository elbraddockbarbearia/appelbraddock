const express = require('express');
const router = express.Router();
const { loginAdmin, registerClient, loginClient, getMe } = require('../controllers/authController');
const protect = require('../middleware/authMiddleware');
const validateData = require('../middleware/validateData');
const { registerSchema, loginClientSchema } = require('../validations/schemas');

// Admin
router.post('/login', loginAdmin);

// Client
router.post('/register', validateData(registerSchema), registerClient);
router.post('/login/client', validateData(loginClientSchema), loginClient);
router.get('/me', protect(['client']), getMe);

module.exports = router;
