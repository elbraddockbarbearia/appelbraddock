const express = require('express');
const router = express.Router();
const { getServices, getServicesAdmin, createService, updateService, deleteService } = require('../controllers/serviceController');
const protect = require('../middleware/authMiddleware');

router.route('/')
  .get(getServices) // Public: clients need to see active services
  .post(protect(['admin']), createService); // Admin only

router.route('/admin')
  .get(protect(['admin']), getServicesAdmin); // Admin: all services

router.route('/:id')
  .put(protect(['admin']), updateService)
  .delete(protect(['admin']), deleteService);

module.exports = router;
