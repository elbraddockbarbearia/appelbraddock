const express = require('express');
const router = express.Router();
const { getNotifications, markRead, markAllRead } = require('../controllers/notificationController');
const protect = require('../middleware/authMiddleware');

router.get('/',                    protect(['admin', 'barber']), getNotifications);
router.patch('/:id/read',          protect(['admin', 'barber']), markRead);
router.patch('/read-all',          protect(['admin', 'barber']), markAllRead);

module.exports = router;
