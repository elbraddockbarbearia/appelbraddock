const Cashier = require('../../data/models/Cashier');
const Appointment = require('../../data/models/Appointment');

// Get cashier entries with optional date filter
const getCashierEntries = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let filter = {};

    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate + 'T00:00:00.000Z'),
        $lte: new Date(endDate + 'T23:59:59.999Z'),
      };
    } else if (startDate) {
      filter.date = {
        $gte: new Date(startDate + 'T00:00:00.000Z'),
        $lte: new Date(startDate + 'T23:59:59.999Z'),
      };
    }

    const entries = await Cashier.find(filter).sort({ date: -1 });
    res.json(entries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add a new entry
const addCashierEntry = async (req, res) => {
  try {
    const { type, amount, description, payment_method, card_fee } = req.body;

    const entry = await Cashier.create({
      type,
      amount,
      description,
      payment_method: payment_method || 'dinheiro',
      card_fee: card_fee || 0,
    });

    res.status(201).json(entry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get daily financial report
const getDailyReport = async (req, res) => {
  try {
    const date = req.query.date || new Date().toISOString().split('T')[0];
    const start = new Date(date + 'T00:00:00.000Z');
    const end   = new Date(date + 'T23:59:59.999Z');

    const entries = await Cashier.find({ date: { $gte: start, $lte: end } });

    const totalIncome  = entries.filter(e => e.type === 'entrada').reduce((s, e) => s + e.amount, 0);
    const totalExpense = entries.filter(e => e.type === 'saida').reduce((s, e) => s + e.amount, 0);
    const revenue      = totalIncome - totalExpense;

    // Completed appointments today for ticket médio
    const completedToday = await Appointment.find({ date, status: 'completed' }).populate('service');
    const totalSales = completedToday.length;
    const ticketMedio = totalSales > 0 ? completedToday.reduce((s, a) => s + (a.price || 0), 0) / totalSales : 0;

    // Most sold service today
    const serviceCounts = {};
    completedToday.forEach(a => {
      const name = a.service?.name || 'Desconhecido';
      serviceCounts[name] = (serviceCounts[name] || 0) + 1;
    });
    const topService = Object.entries(serviceCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

    // Payment method breakdown
    const byMethod = {};
    entries.filter(e => e.type === 'entrada').forEach(e => {
      const m = e.payment_method || 'dinheiro';
      byMethod[m] = (byMethod[m] || 0) + e.amount;
    });

    res.json({ totalIncome, totalExpense, revenue, ticketMedio, topService, totalSales, byMethod });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get monthly report
const getMonthlyReport = async (req, res) => {
  try {
    const now = new Date();
    const year = req.query.year || now.getFullYear();
    const month = req.query.month || (now.getMonth() + 1);

    const start = new Date(`${year}-${String(month).padStart(2, '0')}-01T00:00:00.000Z`);
    const end   = new Date(start);
    end.setMonth(end.getMonth() + 1);

    const entries = await Cashier.find({ date: { $gte: start, $lt: end } });

    const totalIncome  = entries.filter(e => e.type === 'entrada').reduce((s, e) => s + e.amount, 0);
    const totalExpense = entries.filter(e => e.type === 'saida').reduce((s, e) => s + e.amount, 0);
    const revenue      = totalIncome - totalExpense;
    const totalEntries = entries.length;

    res.json({ totalIncome, totalExpense, revenue, totalEntries, month, year });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCashierEntries,
  addCashierEntry,
  getDailyReport,
  getMonthlyReport
};
