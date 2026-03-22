const cron = require('node-cron');
const Appointment = require('../../data/models/Appointment');
const Client = require('../../data/models/Client');
const { sendReminderEmail } = require('../services/emailService');
const { createNotification } = require('../controllers/notificationController');

// Run every 5 minutes — lembretes de agendamento por email
cron.schedule('*/5 * * * *', async () => {
  try {
    const now = new Date();
    const oneHourAndFiveMinsFromNow = new Date(now.getTime() + 65 * 60 * 1000);

    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    const appointmentsToday = await Appointment.find({
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ['confirmed', 'pending'] },
      reminderSent: false,
    });

    for (const appt of appointmentsToday) {
      const [hours, minutes] = appt.time.split(':').map(Number);
      const apptDateTime = new Date(appt.date);
      apptDateTime.setHours(hours, minutes, 0, 0);

      if (apptDateTime > now && apptDateTime <= oneHourAndFiveMinsFromNow) {
        const client = await Client.findById(appt.client_id);
        if (client && client.email) {
          await sendReminderEmail(client.email, client.name || client.nickname, {
            date: appt.date,
            time: appt.time,
            service: appt.service
          });
        }
        appt.reminderSent = true;
        await appt.save();
      }
    }

  } catch (error) {
    console.error('Error running reminder cron job:', error.message);
  }
});

// ─── Cron de mensalidade — roda todo dia às 09:00 ────────────────────────────
cron.schedule('0 9 * * *', async () => {
  try {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const em3Dias = new Date(hoje);
    em3Dias.setDate(em3Dias.getDate() + 3);

    const clientesAtivos = await Client.find({ 'plano.ativo': true });

    for (const client of clientesAtivos) {
      const vencimento = new Date(client.plano.dataVencimento);
      vencimento.setHours(0, 0, 0, 0);

      const dataFormatada = vencimento.toLocaleDateString('pt-BR');

      // Lembrete 3 dias antes
      if (vencimento.getTime() === em3Dias.getTime()) {
        await createNotification({
          recipient_type: 'admin',
          type: 'plan_expiring',
          message: `⏰ Plano de ${client.name} vence em 3 dias (${dataFormatada}). Entre em contato para renovar.`,
          data: { clientId: client._id },
        });
      }

      // Expirar no dia do vencimento
      if (vencimento.getTime() === hoje.getTime()) {
        client.plano.ativo = false;
        client.plano.cortesRestantes = 0;
        await client.save();

        await createNotification({
          recipient_type: 'admin',
          type: 'plan_expired',
          message: `🚨 Plano de ${client.name} venceu hoje (${dataFormatada}). Renovação pendente.`,
          data: { clientId: client._id },
        });
      }
    }

  } catch (error) {
    console.error('Erro no cron de mensalidade:', error.message);
  }
});

