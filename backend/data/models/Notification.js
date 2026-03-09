const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient_type: {
    type: String,
    enum: ['admin', 'barber'],
    required: true,
  },
  barber_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Barber',
    default: null,
  },
  type: {
    type: String,
    enum: ['new_appointment', 'new_client', 'appointment_cancelled', 'appointment_confirmed'],
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  read: {
    type: Boolean,
    default: false,
  },
  created_at: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('Notification', notificationSchema);
