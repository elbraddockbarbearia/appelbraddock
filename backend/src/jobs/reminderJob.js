const cron = require('node-cron');
const Appointment = require('../../data/models/Appointment');
const Client = require('../../data/models/Client');
const { sendReminderEmail } = require('../services/emailService');

// Run every 5 minutes
cron.schedule('*/5 * * * *', async () => {
  try {
    const now = new Date();
    // We want to find appointments happening within the next 1 hour 
    // and up to 1 hour and 5 minutes (to avoid missing any between the 5-min intervals).
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
    const oneHourAndFiveMinsFromNow = new Date(now.getTime() + 65 * 60 * 1000);

    // We'll approximate date parsing based on how 'date' and 'time' are structured in the schema.
    // 'date' is a Date object (usually midnight UTC if passed from a picker).
    // 'time' is a String "HH:MM".
    // Alternatively, a simpler approach is fetching appointments for the day, and validating times in memory.
    
    // Start of current day to End of current day (Local/Server time approximation)
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
      // Parse string "HH:MM"
      const [hours, minutes] = appt.time.split(':').map(Number);
      
      const apptDateTime = new Date(appt.date);
      // Adjust timezone off-by-one by keeping it attached to the actual date object hours,
      // or parsing strictly by building a local date.
      // Easiest is to set hours and minutes to the 'date':
      apptDateTime.setHours(hours, minutes, 0, 0);

      // If the appointment time falls in [now, now + 1hr5m]
      // And it's technically > now (we don't want to remind if it's already past the time suddenly)
      if (apptDateTime > now && apptDateTime <= oneHourAndFiveMinsFromNow) {
        // Find client email
        const client = await Client.findById(appt.client_id);
        if (client && client.email) {
          await sendReminderEmail(client.email, client.name || client.nickname, {
            date: appt.date,
            time: appt.time,
            service: appt.service
          });
        }
        
        // Mark as sent regardless if they have email or not (we checked them).
        appt.reminderSent = true;
        await appt.save();
      }
    }

  } catch (error) {
    console.error('Error running reminder cron job:', error.message);
  }
});
