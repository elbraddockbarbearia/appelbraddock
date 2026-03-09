const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  duration: {
    type: Number, // duration in minutes
    required: true,
    default: 30,
  },
  active: {
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model('Service', serviceSchema);
