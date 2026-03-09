const Appointment = require('../../data/models/Appointment');
const Cashier = require('../../data/models/Cashier');
const Client = require('../../data/models/Client');

const WEEKDAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

// Get dashboard summary with advanced analytics (Admin only)
const getDashboardSummary = async (req, res) => {
  try {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    // --- TODAY ---
    const apptToday = await Appointment.find({ date: todayStr, status: { $nin: ['cancelled', 'blocked'] } })
      .populate('client_id', 'name')
      .populate('service', 'name price')
      .populate('barber_id', 'name nickname')
      .sort({ time: 1 });

    const cutsToday = apptToday.filter(a => a.status === 'completed').length;

    // Revenue today from cashier
    const startOfDay = new Date(todayStr + 'T00:00:00.000Z');
    const endOfDay   = new Date(todayStr + 'T23:59:59.999Z');
    const entriesToday = await Cashier.find({ date: { $gte: startOfDay, $lte: endOfDay }, type: 'entrada' });
    const revenueToday = entriesToday.reduce((s, e) => s + e.amount, 0);

    // New clients today
    const newClients = await Client.countDocuments({ signup_date: { $gte: startOfDay } });

    // Average ticket (from completed appointments with price)
    const completedWithPrice = await Appointment.find({ status: 'completed', price: { $gt: 0 } });
    const ticketMedio = completedWithPrice.length > 0
      ? completedWithPrice.reduce((s, a) => s + a.price, 0) / completedWithPrice.length
      : 0;

    // --- ANALYTICS: Busiest hour ---
    const allCompleted = await Appointment.find({ status: 'completed' });
    const hourMap = {};
    allCompleted.forEach(a => {
      const h = a.time?.split(':')[0];
      if (h) hourMap[h] = (hourMap[h] || 0) + 1;
    });
    const busiestHour = Object.entries(hourMap).sort((a, b) => b[1] - a[1])[0];

    // --- ANALYTICS: Busiest weekday ---
    const dayMap = {};
    allCompleted.forEach(a => {
      if (!a.date) return;
      const d = new Date(a.date + 'T12:00:00Z');
      const day = WEEKDAYS[d.getDay()];
      dayMap[day] = (dayMap[day] || 0) + 1;
    });
    const busiestDay = Object.entries(dayMap).sort((a, b) => b[1] - a[1])[0];

    // Build weekday bars (all 7 days sorted Mon→Sun)
    const weekdayOrder = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
    const maxDayCount = Math.max(...Object.values(dayMap), 1);
    const weekdayData = weekdayOrder.map(day => ({
      day,
      count: dayMap[day] || 0,
      pct: Math.round(((dayMap[day] || 0) / maxDayCount) * 100),
    }));

    // Build hour bars (09–18)
    const hours = ['09', '10', '11', '12', '14', '15', '16', '17', '18'];
    const maxHourCount = Math.max(...Object.values(hourMap), 1);
    const hourData = hours.map(h => ({
      h: `${h}h`,
      count: hourMap[h] || 0,
      pct: Math.round(((hourMap[h] || 0) / maxHourCount) * 100),
    }));

    // --- ANALYTICS: Top service ---
    const serviceMap = {};
    await Promise.all(allCompleted.map(async a => {
      const appt = await Appointment.findById(a._id).populate('service', 'name');
      const name = appt.service?.name || 'Serviço';
      serviceMap[name] = (serviceMap[name] || 0) + 1;
    }));
    const topServices = Object.entries(serviceMap).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const maxSvc = Math.max(...topServices.map(s => s[1]), 1);
    const serviceData = topServices.map(([name, count]) => ({ name, count, pct: Math.round((count / maxSvc) * 100) }));

    // --- Top 3 clients by total cuts ---
    const topClients = await Client.find({ total_cuts: { $gt: 0 } })
      .sort({ total_cuts: -1 })
      .limit(3)
      .select('name total_cuts points');

    // --- Recent appointments (today) ---
    const recentAppointments = apptToday.slice(0, 5).map(a => ({
      _id: a._id,
      client: a.client_id?.name || 'Cliente',
      service: a.service?.name || 'Serviço',
      barber: a.barber_id?.name || null,
      time: a.time,
      status: a.status,
    }));

    res.json({
      // Summary
      cutsToday,
      revenueToday,
      newClients,
      ticketMedio,
      // Analytics
      busiestHour: busiestHour ? `${busiestHour[0]}h (${busiestHour[1]} cortes)` : null,
      busiestDay:  busiestDay  ? `${busiestDay[0]} (${busiestDay[1]} cortes)` : null,
      weekdayData,
      hourData,
      serviceData,
      // Lists
      topClients,
      recentAppointments,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDashboardSummary };
