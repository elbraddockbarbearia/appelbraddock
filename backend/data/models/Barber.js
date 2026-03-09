const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const barberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  nickname: {
    type: String,
    default: '',
  },
  phone: {
    type: String,
    default: '',
  },
  specialties: {
    type: [String],
    default: [],
  },
  commission_rate: {
    type: Number,
    default: 0,
  },
  email: {
    type: String,
    default: '',
    lowercase: true,
  },
  password_hash: {
    type: String,
    default: '',
  },
  active: {
    type: Boolean,
    default: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  }
});

// Method to verify password
barberSchema.methods.matchPassword = async function(entered) {
  if (!this.password_hash) return false;
  return bcrypt.compare(entered, this.password_hash);
};

module.exports = mongoose.model('Barber', barberSchema);
