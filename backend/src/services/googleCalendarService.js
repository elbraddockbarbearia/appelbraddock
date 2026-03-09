const { google } = require('googleapis');

/**
 * Google Calendar service for El Braddock.
 * Uses OAuth 2.0 with a long-lived refresh token.
 *
 * Required environment variables (set after running authorize_google.js):
 *   GOOGLE_CLIENT_ID
 *   GOOGLE_CLIENT_SECRET
 *   GOOGLE_REFRESH_TOKEN
 *   GOOGLE_CALENDAR_ID   — seu e-mail do Google (ex: seu@gmail.com)
 */

const isConfigured = () =>
  process.env.GOOGLE_CLIENT_ID &&
  process.env.GOOGLE_CLIENT_SECRET &&
  process.env.GOOGLE_REFRESH_TOKEN &&
  process.env.GOOGLE_CALENDAR_ID;

const getCalendar = () => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
  );
  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  });
  return google.calendar({ version: 'v3', auth: oauth2Client });
};

/**
 * Create a calendar event for a new appointment.
 * Returns the Google event ID.
 */
const createCalendarEvent = async ({ date, time, clientName, serviceName, barberName, price }) => {
  if (!isConfigured()) return null;
  try {
    const calendar = getCalendar();
    const start = new Date(`${date}T${time}:00`);
    const end = new Date(start.getTime() + 30 * 60000);

    const summary = `Cliente: ${clientName} - ${serviceName}`;
    const description = [
      `Cliente: ${clientName}`,
      `Serviço: ${serviceName}`,
      barberName ? `Barbeiro: ${barberName}` : null,
      price ? `Valor: R$ ${price}` : null,
      '',
      'Agendado via El Braddock',
    ].filter(v => v !== null).join('\n');

    const { data } = await calendar.events.insert({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      resource: {
        summary,
        description,
        start: { dateTime: start.toISOString(), timeZone: 'America/Sao_Paulo' },
        end:   { dateTime: end.toISOString(),   timeZone: 'America/Sao_Paulo' },
        colorId: '5', // banana (pending)
      },
    });

    console.log('[GoogleCalendar] Event created:', data.id);
    return data.id;
  } catch (err) {
    console.error('[GoogleCalendar] Failed to create event:', err.message);
    return null;
  }
};

/**
 * Delete a calendar event (on appointment cancellation).
 */
const deleteCalendarEvent = async (eventId) => {
  if (!isConfigured() || !eventId) return;
  try {
    await getCalendar().events.delete({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      eventId,
    });
    console.log('[GoogleCalendar] Event deleted:', eventId);
  } catch (err) {
    console.error('[GoogleCalendar] Failed to delete event:', err.message);
  }
};

/**
 * Update event color/summary prefix when status changes.
 * colorId: 5=banana (pending), 2=sage (confirmed), 8=graphite (completed)
 */
const updateCalendarEventColor = async (eventId, colorId, summaryPrefix) => {
  if (!isConfigured() || !eventId) return;
  try {
    const calendar = getCalendar();
    const { data: existing } = await calendar.events.get({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      eventId,
    });
    const baseSummary = existing.summary.replace(/^[\u2702\u2705\u2714\ufe0f✂️✅✔️]+\s*/, '');
    await calendar.events.patch({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      eventId,
      resource: {
        colorId,
        summary: `${summaryPrefix} ${baseSummary}`,
      },
    });
    console.log('[GoogleCalendar] Event updated:', eventId);
  } catch (err) {
    console.error('[GoogleCalendar] Failed to update event:', err.message);
  }
};

module.exports = { createCalendarEvent, deleteCalendarEvent, updateCalendarEventColor };
