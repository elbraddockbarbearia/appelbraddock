const express = require('express');
const router = express.Router();
const { getClients, getClient, getInactiveClients, getUpcomingBirthdays } = require('../controllers/clientController');
const protect = require('../middleware/authMiddleware');

// Only admin can list all clients
router.get('/', protect(['admin']), getClients);

// Retention endpoints (admin only)
router.get('/inactive', protect(['admin']), getInactiveClients);
router.get('/birthdays', protect(['admin']), getUpcomingBirthdays);

// Get client by ID (admin or the client themselves)
router.get('/:id', protect(['admin', 'client']), getClient);

module.exports = router;
