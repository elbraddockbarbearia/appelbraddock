const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const clientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Nome é obrigatório'],
    trim: true,
  },
  nickname: {
    type: String,
    trim: true,
  },
  phone: {
    type: String,
    required: [true, 'Telefone é obrigatório'],
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
  },
  birthday: {
    type: Date,
  },
  password: {
    type: String,
    required: [true, 'Senha é obrigatória'],
    minlength: 3,
    select: false, // never returned by default
  },
  total_cuts: {
    type: Number,
    default: 0,
  },
  points: {
    type: Number,
    default: 0,
  },
  signup_date: {
    type: Date,
    default: Date.now,
  },
  plano: {
    ativo: { type: Boolean, default: false },
    tipo: { type: String, enum: ['normal', 'vip'], default: 'normal' },
    dataPagamento: { type: Date, default: null },
    dataVencimento: { type: Date, default: null },
    cortesRestantes: { type: Number, default: 0 },
    cortesTotais: { type: Number, default: 4 },
  },
}, { timestamps: true });

// Hash password before saving
clientSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password helper
clientSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
};

// Indexes for optimization
clientSchema.index({ total_cuts: -1 });

module.exports = mongoose.model('Client', clientSchema);
