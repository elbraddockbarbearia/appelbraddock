const express = require('express');
const router = express.Router();
const {
  getBarbers, getBarbersAdmin,
  createBarber, updateBarber, deleteBarber,
  getCommissionReport
} = require('../controllers/barberController');
const protect = require('../middleware/authMiddleware');

router.get('/',       getBarbers);                           // Public
router.get('/admin',  protect(['admin']), getBarbersAdmin);  // Admin - all
router.post('/',      protect(['admin']), createBarber);
router.put('/:id',    protect(['admin']), updateBarber);
router.delete('/:id', protect(['admin']), deleteBarber);

router.get('/report/commission', protect(['admin']), getCommissionReport);

module.exports = router;
