const bcrypt = require('bcryptjs');
const Barber = require('../../data/models/Barber');
const Appointment = require('../../data/models/Appointment');

// Get active barbers (Public)
const getBarbers = async (req, res) => {
  try {
    const barbers = await Barber.find({ active: true }).select('-commission_rate');
    res.json(barbers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get ALL barbers (Admin)
const getBarbersAdmin = async (req, res) => {
  try {
    const barbers = await Barber.find({}).sort({ name: 1 }).select('-password_hash');
    res.json(barbers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a barber (Admin)
const createBarber = async (req, res) => {
  try {
    const { name, nickname, phone, specialties, commission_rate, email, password } = req.body;
    if (!name) return res.status(400).json({ message: 'Nome é obrigatório' });

    const data = { name, nickname, phone, specialties, commission_rate };
    if (email) data.email = email.toLowerCase().trim();
    if (password) data.password_hash = await bcrypt.hash(password, 10);

    const barber = await Barber.create(data);
    const safe = barber.toObject();
    delete safe.password_hash;
    res.status(201).json(safe);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a barber (Admin)
const updateBarber = async (req, res) => {
  try {
    const barber = await Barber.findById(req.params.id);
    if (!barber) return res.status(404).json({ message: 'Barbeiro não encontrado' });

    const fields = ['name', 'nickname', 'phone', 'specialties', 'commission_rate', 'active', 'email'];
    fields.forEach(f => { if (req.body[f] !== undefined) barber[f] = req.body[f]; });

    if (req.body.password) {
      barber.password_hash = await bcrypt.hash(req.body.password, 10);
    }

    const updated = await barber.save();
    const safe = updated.toObject();
    delete safe.password_hash;
    res.json(safe);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a barber (Admin)
const deleteBarber = async (req, res) => {
  try {
    const barber = await Barber.findById(req.params.id);
    if (!barber) return res.status(404).json({ message: 'Barbeiro não encontrado' });

    await barber.deleteOne();
    res.json({ message: 'Barbeiro removido' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get commission report for a period (Admin)
const getCommissionReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const filter = { status: 'completed' };
    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate + 'T23:59:59.999Z'),
      };
    }

    const appointments = await Appointment.find(filter)
      .populate('barber_id', 'name nickname commission_rate')
      .populate('service', 'name');

    // Group by barber
    const barberMap = {};
    appointments.forEach(appt => {
      if (!appt.barber_id) return;
      const id = appt.barber_id._id.toString();
      if (!barberMap[id]) {
        barberMap[id] = {
          barber: appt.barber_id,
          totalCuts: 0,
          totalRevenue: 0,
          commission: 0,
        };
      }
      barberMap[id].totalCuts += 1;
      barberMap[id].totalRevenue += appt.price || 0;
      barberMap[id].commission = (barberMap[id].totalRevenue * (appt.barber_id.commission_rate || 0)) / 100;
    });

    res.json(Object.values(barberMap));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getBarbers,
  getBarbersAdmin,
  createBarber,
  updateBarber,
  deleteBarber,
  getCommissionReport,
};
