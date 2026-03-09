const express = require('express');
const router = express.Router();
const { getCashierEntries, addCashierEntry, getDailyReport, getMonthlyReport } = require('../controllers/cashierController');
const protect = require('../middleware/authMiddleware');

router.route('/')
  .get(protect(['admin']), getCashierEntries)
  .post(protect(['admin']), addCashierEntry);

router.get('/report/daily',   protect(['admin']), getDailyReport);
router.get('/report/monthly', protect(['admin']), getMonthlyReport);

module.exports = router;
