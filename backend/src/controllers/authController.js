const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Client = require('../../data/models/Client');

const signToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET || 'secretkey', { expiresIn: '30d' });

// ─── Admin Login ─────────────────────────────────────────────────────────────
const loginAdmin = async (req, res) => {
  const { password } = req.body;
  
  // Allow multiple admins if configured, fallback to default 3 admins
  const configuredPasswords = process.env.ADMIN_PASSWORDS 
    ? process.env.ADMIN_PASSWORDS.split(',')
    : ['admin123', 'admin456', 'admin789'];
    
  if (!configuredPasswords.includes(password)) {
    return res.status(401).json({ message: 'Credenciais inválidas.' });
  }

  const token = signToken({ role: 'admin' });
  res.json({ token, role: 'admin' });
};

// ─── Client Register ─────────────────────────────────────────────────────────
const registerClient = async (req, res) => {
  try {
    let { name, nickname, phone, email, birthday, password } = req.body;
    
    // Sanitize phone (keep only numbers)
    if (phone) phone = phone.replace(/\D/g, '');

    if (!name || !phone || !password) {
      return res.status(400).json({ message: 'Nome, telefone e senha são obrigatórios.' });
    }

    // Check if phone already exists
    const exists = await Client.findOne({ phone });
    if (exists) {
      return res.status(409).json({ message: 'Este telefone já está cadastrado. Faça login.' });
    }

    const client = await Client.create({ name, nickname, phone, email, birthday, password });

    const safeClient = {
      _id: client._id,
      name: client.name,
      nickname: client.nickname,
      phone: client.phone,
      email: client.email,
      birthday: client.birthday,
      total_cuts: client.total_cuts,
      points: client.points,
      plano: client.plano,
    };

    const token = signToken({ id: client._id, role: 'client' });
    res.status(201).json({ token, client: safeClient });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Este telefone já está cadastrado.' });
    }
    res.status(500).json({ message: error.message });
  }
};

// ─── Client Login ─────────────────────────────────────────────────────────────
const loginClient = async (req, res) => {
  try {
    let { phone, password } = req.body;

    // Sanitize phone
    if (phone) phone = phone.replace(/\D/g, '');

    if (!phone || !password) {
      return res.status(400).json({ message: 'Telefone e senha são obrigatórios.' });
    }

    const client = await Client.findOne({ phone }).select('+password');
    if (!client) {
      return res.status(401).json({ message: 'Telefone ou senha incorretos.' });
    }

    const isMatch = await client.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Telefone ou senha incorretos.' });
    }

    const safeClient = {
      _id: client._id,
      name: client.name,
      nickname: client.nickname,
      phone: client.phone,
      email: client.email,
      birthday: client.birthday,
      total_cuts: client.total_cuts,
      points: client.points,
      plano: client.plano,
    };

    const token = signToken({ id: client._id, role: 'client' });
    res.json({ token, client: safeClient });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Get My Profile ───────────────────────────────────────────────────────────
const getMe = async (req, res) => {
  try {
    const client = await Client.findById(req.user.id);
    if (!client) return res.status(404).json({ message: 'Cliente não encontrado.' });
    res.json(client);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { loginAdmin, registerClient, loginClient, getMe };
