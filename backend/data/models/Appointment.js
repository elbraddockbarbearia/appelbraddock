const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  client_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: false,
  },
  barber_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Barber',
    required: false,
  },
  date: {
    type: Date, // YYYY-MM-DD format usually stored as Date
    required: true,
  },
  time: {
    type: String, // HH:mm format
    required: true,
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: false,
  },
  price: {
    type: Number,
    required: false,
  },
  google_calendar_event_id: {
    type: String,
    default: null,
    required: false,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled', 'blocked'],
    default: 'pending',
  },
  reminderSent: {
    type: Boolean,
    default: false,
  },
  created_at: {
    type: Date,
    default: Date.now,
  }
});

// Indexes for optimization
appointmentSchema.index({ date: 1, time: 1 });
appointmentSchema.index({ client_id: 1, date: -1 });
appointmentSchema.index({ barber_id: 1, date: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
