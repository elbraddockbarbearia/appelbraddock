const express = require('express');
const router = express.Router();
const { loginBarber, getMyAgenda, getMyStats } = require('../controllers/barberAuthController');
const { getNotifications, markRead, markAllRead } = require('../controllers/notificationController');
const protect = require('../middleware/authMiddleware');

// Public
router.post('/login', loginBarber);

// Protected (barber only)
router.get('/me/agenda',         protect(['barber']), getMyAgenda);
router.get('/me/stats',          protect(['barber']), getMyStats);
router.get('/me/notifications',  protect(['barber']), (req, res, next) => {
  req.query.type = 'barber';
  req.query.barber_id = req.barber_id;
  next();
}, getNotifications);
router.patch('/me/notifications/:id/read', protect(['barber']), markRead);
router.patch('/me/notifications/read-all', protect(['barber']), (req, res, next) => {
  req.body = { type: 'barber', barber_id: req.barber_id?.toString() };
  next();
}, markAllRead);

module.exports = router;
