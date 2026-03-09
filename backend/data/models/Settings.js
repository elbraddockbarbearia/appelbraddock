const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  operating_hours: {
    start: { type: String, default: '09:00' },
    end: { type: String, default: '19:30' },
    days: {
      type: [String],
      default: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab']
    }
  },
  interval_minutes: {
    type: Number,
    default: 30
  },
  loyalty: {
    cuts_required: { type: Number, default: 10 },
    reward: { type: String, default: '1 corte grátis' }
  }
});

module.exports = mongoose.model('Settings', settingsSchema);
