const mongoose = require('mongoose');

const cashierSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['entrada', 'saida'],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  payment_method: {
    type: String,
    enum: ['dinheiro', 'pix', 'cartao', 'outro'],
    default: 'dinheiro',
  },
  card_fee: {
    type: Number,
    default: 0, // percentage, e.g. 2.99 means 2.99%
  }
});

module.exports = mongoose.model('Cashier', cashierSchema);
