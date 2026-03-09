const nodemailer = require('nodemailer');

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Helper function to format date
const formatDate = (dateString, timeString) => {
  const d = new Date(dateString);
  return `${d.toLocaleDateString('pt-BR')} às ${timeString}`;
};

// Send Confirmation Email
const sendConfirmationEmail = async (clientEmail, clientName, appointmentDetails) => {
  if (!process.env.EMAIL_USER || process.env.EMAIL_USER === 'seu_email@gmail.com') {
    console.log('Skipping validation email: Credentials not configured');
    return;
  }

  const { date, time, service, price } = appointmentDetails;
  const formattedDate = formatDate(date, time);

  const mailOptions = {
    from: `"El Braddock Barber 💈" <${process.env.EMAIL_USER}>`,
    to: clientEmail,
    subject: 'Agendamento Confirmado - El Braddock Barber',
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #0f0f0f; padding: 20px; text-align: center;">
          <h2 style="color: #cba052; margin: 0; font-size: 24px; letter-spacing: 2px;">EL BRADDOCK</h2>
        </div>
        <div style="padding: 20px;">
          <p>Olá <strong>${clientName}</strong>,</p>
          <p>Seu horário na barbearia foi confirmado com sucesso!</p>
          <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #cba052; margin: 20px 0;">
            <ul style="list-style: none; padding: 0; margin: 0;">
              <li style="margin-bottom: 8px;">📅 <strong>Data/Hora:</strong> ${formattedDate}</li>
              <li style="margin-bottom: 8px;">✂️ <strong>Serviço:</strong> ${service}</li>
              <li>💰 <strong>Valor:</strong> ${Number(price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</li>
            </ul>
          </div>
          <p>Te esperamos no horário marcado. Se precisar reagendar ou cancelar, por favor nos avise com antecedência.</p>
        </div>
        <div style="background-color: #f1f1f1; padding: 10px; text-align: center; font-size: 12px; color: #777;">
          © ${new Date().getFullYear()} El Braddock Barbearia. Todos os direitos reservados.
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Confirmation email sent to ${clientEmail}`);
  } catch (error) {
    console.error('Error sending confirmation email:', error.message);
  }
};

// Send Reminder Email (1 hour before)
const sendReminderEmail = async (clientEmail, clientName, appointmentDetails) => {
  if (!process.env.EMAIL_USER || process.env.EMAIL_USER === 'seu_email@gmail.com') {
    return; // Silent bypass if not configured
  }

  const { date, time, service } = appointmentDetails;
  const formattedDate = formatDate(date, time);

  const mailOptions = {
    from: `"El Braddock Barber 💈" <${process.env.EMAIL_USER}>`,
    to: clientEmail,
    subject: '⏳ Lembrete do seu horário - El Braddock Barber',
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #0f0f0f; padding: 20px; text-align: center;">
          <h2 style="color: #cba052; margin: 0; font-size: 24px; letter-spacing: 2px;">EL BRADDOCK</h2>
        </div>
        <div style="padding: 20px;">
          <p>Fala <strong>${clientName}</strong>, falta pouco!</p>
          <p>Gostaríamos de lembrar que o seu horário está chegando.</p>
          <div style="background-color: rgba(203,160,82,0.1); padding: 15px; border-left: 4px solid #cba052; margin: 20px 0;">
             <ul style="list-style: none; padding: 0; margin: 0;">
              <li style="margin-bottom: 8px;">📅 <strong>Horário:</strong> ${formattedDate}</li>
              <li>✂️ <strong>Serviço:</strong> ${service}</li>
            </ul>
          </div>
          <p>Dica: Tente chegar uns 10 minutinhos antes para não atrasar o seu atendimento. Vemos você em breve!</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Reminder email sent to ${clientEmail}`);
  } catch (error) {
    console.error('Error sending reminder email:', error.message);
  }
};

module.exports = {
  sendConfirmationEmail,
  sendReminderEmail,
};
