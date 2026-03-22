const Appointment = require('../../data/models/Appointment');
const Client = require('../../data/models/Client');
const { createNotification } = require('./notificationController');
const { createCalendarEvent, deleteCalendarEvent, updateCalendarEventColor } = require('../services/googleCalendarService');
const { sendConfirmationEmail } = require('../services/emailService');

// Create appointment
const createAppointment = async (req, res) => {
  try {
    let { client_id, barber_id, date, time, service_id, price } = req.body;

    // ── Verificação de plano ────────────────────────────────────────────────
    if (client_id) {
      const clientForPlan = await Client.findById(client_id).select('name plano');
      if (clientForPlan) {
        const plano = clientForPlan.plano;
        const hoje = new Date();

        // Auto-expirar plano se a data de vencimento já passou
        if (plano?.ativo && plano?.dataVencimento && new Date(plano.dataVencimento) < hoje) {
          clientForPlan.plano.ativo = false;
          clientForPlan.plano.cortesRestantes = 0;
          await clientForPlan.save();
          return res.status(403).json({
            message: '⚠️ Plano vencido! Renove a mensalidade para agendar.',
          });
        }

        // Bloquear se plano inativo ou sem cortes restantes
        if (plano?.ativo && plano?.cortesRestantes <= 0) {
          return res.status(403).json({
            message: '⚠️ Você já usou todos os cortes deste mês. Renove para agendar.',
          });
        }
        // Usar plano se estiver ativo
        if (plano?.ativo && plano?.cortesRestantes > 0) {
          price = 0;
        }
      }
    }
    // ── Fim verificação de plano ────────────────────────────────────────────

    // Check for double booking (per barber if specified, otherwise global)
    const doubleCheck = { date, time, status: { $nin: ['cancelled', 'blocked'] } };
    if (barber_id) doubleCheck.barber_id = barber_id;
    const existing = await Appointment.findOne(doubleCheck);
    if (existing) {
      return res.status(400).json({ message: 'Horário já reservado' });
    }

    const appointment = await Appointment.create({
      client_id,
      barber_id: barber_id || null,
      date,
      time,
      service: service_id,
      price
    });

    // Populate for notification message
    const populated = await appointment.populate([
      { path: 'client_id', select: 'name' },
      { path: 'service', select: 'name' },
      { path: 'barber_id', select: 'name' },
    ]);
    const clientName = populated.client_id?.name || 'Cliente';
    const serviceName = populated.service?.name || 'Serviço';
    const barberName = populated.barber_id?.name;

    // Notify admin
    await createNotification({
      recipient_type: 'admin',
      type: 'new_appointment',
      message: `Novo agendamento: ${clientName} — ${serviceName} às ${time}${barberName ? ` com ${barberName}` : ''}`,
      data: { appointment_id: appointment._id, date, time, clientName, serviceName },
    });

    // Send Confirmation Email
    const clientRecord = await Client.findById(client_id);
    if (clientRecord && clientRecord.email) {
      await sendConfirmationEmail(clientRecord.email, clientName, {
        date,
        time,
        service: serviceName,
        price
      });
    }

    // Notify the assigned barber
    if (barber_id) {
      await createNotification({
        recipient_type: 'barber',
        barber_id,
        type: 'new_appointment',
        message: `Novo agendamento: ${clientName} — ${serviceName} às ${time} (${date})`,
        data: { appointment_id: appointment._id, date, time, clientName, serviceName },
      });
    }

    // Create Google Calendar event (silently no-ops if credentials not set)
    const calEventId = await createCalendarEvent({
      date,
      time,
      clientName,
      serviceName,
      barberName,
      price,
    });
    if (calEventId) {
      await Appointment.findByIdAndUpdate(appointment._id, { google_calendar_event_id: calEventId });
    }

    res.status(201).json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get appointments for a specific day
const getAppointmentsByDate = async (req, res) => {
  try {
    const { date, barber_id } = req.query;
    const filter = { date };
    if (barber_id) filter.barber_id = barber_id;
    
    const appointments = await Appointment.find(filter)
      .populate('client_id', 'name phone')
      .populate('service', 'name price')
      .populate('barber_id', 'name nickname');
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    const oldStatus = appointment.status;

    appointment.status = status;
    await appointment.save();

    // If changing to completed, add cut and points to client
    if (oldStatus !== 'completed' && status === 'completed') {
      const client = await Client.findById(appointment.client_id);
      if (client) {
        client.total_cuts += 1;
        client.points += 1; // Assuming 1 pt per cut
        // Decrementar cortes do plano se estiver ativo
        if (client.plano?.ativo && client.plano.cortesRestantes > 0) {
          client.plano.cortesRestantes -= 1;
        }
        await client.save();
      }
    } else if (oldStatus === 'completed' && status !== 'completed') {
      // If reverting from completed, remove cut and points
      const client = await Client.findById(appointment.client_id);
      if (client) {
        client.total_cuts = Math.max(0, client.total_cuts - 1);
        client.points = Math.max(0, client.points - 1);
        // Reverter decremento do plano
        if (client.plano?.ativo) {
          client.plano.cortesRestantes = Math.min(
            client.plano.cortesTotais,
            client.plano.cortesRestantes + 1
          );
        }
        await client.save();
      }
    }

    // Google Calendar sync
    if (status === 'cancelled' && appointment.google_calendar_event_id) {
      await deleteCalendarEvent(appointment.google_calendar_event_id);
    } else if (status === 'confirmed' && appointment.google_calendar_event_id) {
      await updateCalendarEventColor(appointment.google_calendar_event_id, '2', '✅'); // sage green
    } else if (status === 'completed' && appointment.google_calendar_event_id) {
      await updateCalendarEventColor(appointment.google_calendar_event_id, '8', '✔️'); // graphite
    }

    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Block time slot
const blockAppointment = async (req, res) => {
  try {
    const { date, time, barber_id } = req.body;
    
    const existCheck = { date, time, status: { $nin: ['cancelled'] } };
    if (barber_id) existCheck.barber_id = barber_id;
    const existing = await Appointment.findOne(existCheck);
    if (existing) {
      return res.status(400).json({ message: 'Horário já reservado ou bloqueado' });
    }

    const blockedSlot = await Appointment.create({
      date, time,
      barber_id: barber_id || null,
      status: 'blocked'
    });

    res.status(201).json(blockedSlot);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all appointments for a logged-in client
const getClientAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ client_id: req.user.id })
      .populate('service', 'name price duration')
      .populate('barber_id', 'name')
      .sort({ created_at: -1 });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createAppointment,
  getAppointmentsByDate,
  updateAppointmentStatus,
  blockAppointment,
  getClientAppointments
};
