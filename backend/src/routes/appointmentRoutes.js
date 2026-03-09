const express = require('express');
const router = express.Router();
const { createAppointment, getAppointmentsByDate, updateAppointmentStatus, blockAppointment } = require('../controllers/appointmentController');
const protect = require('../middleware/authMiddleware');
const validateData = require('../middleware/validateData');
const { createAppointmentSchema } = require('../validations/schemas');

router.route('/')
  .post(validateData(createAppointmentSchema), createAppointment)
  .get(getAppointmentsByDate);

router.route('/block')
  .post(protect(['admin']), blockAppointment);

router.route('/:id/status')
  .patch(protect(['admin']), updateAppointmentStatus); // Admin finishes or cancels

module.exports = router;
