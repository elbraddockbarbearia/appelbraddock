const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Barber = require('../../data/models/Barber');
const Appointment = require('../../data/models/Appointment');

// Barber Login
const loginBarber = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'E-mail e senha são obrigatórios' });
    }

    const barber = await Barber.findOne({ email: email.toLowerCase().trim() });
    if (!barber || !barber.active) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    const match = await barber.matchPassword(password);
    if (!match) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    const token = jwt.sign(
      { id: barber._id, role: 'barber', barber_id: barber._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      barber: {
        _id: barber._id,
        name: barber.name,
        nickname: barber.nickname,
        email: barber.email,
        specialties: barber.specialties,
        commission_rate: barber.commission_rate,
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get own appointments (Barber portal)
const getMyAgenda = async (req, res) => {
  try {
    const barber_id = req.barber_id;
    const { date } = req.query;
    const filter = { barber_id };
    if (date) filter.date = date;

    const appointments = await Appointment.find(filter)
      .populate('client_id', 'name phone')
      .populate('service', 'name price')
      .sort({ date: 1, time: 1 });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get own stats (Barber portal)
const getMyStats = async (req, res) => {
  try {
    const barber_id = req.barber_id;
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const today = now.toISOString().split('T')[0];

    // This month completed appointments
    const completed = await Appointment.find({
      barber_id,
      status: 'completed',
      date: { $gte: monthStart }
    }).populate('service', 'name');

    const barber = await Barber.findById(barber_id).select('commission_rate name nickname');

    const totalRevenue = completed.reduce((s, a) => s + (a.price || 0), 0);
    const commission = (totalRevenue * (barber.commission_rate || 0)) / 100;
    const totalCuts = completed.length;

    // Today's pending appointments
    const todayAppointments = await Appointment.find({
      barber_id,
      date: today,
      status: { $in: ['pending', 'confirmed'] }
    }).populate('client_id', 'name').populate('service', 'name');

    // Count by service for ranking
    const serviceCount = {};
    completed.forEach(a => {
      const name = a.service?.name || 'Serviço';
      serviceCount[name] = (serviceCount[name] || 0) + 1;
    });
    const topService = Object.entries(serviceCount).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

    res.json({
      barber,
      totalCuts,
      totalRevenue,
      commission,
      topService,
      todayCount: todayAppointments.length,
      todayAppointments,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { loginBarber, getMyAgenda, getMyStats };
