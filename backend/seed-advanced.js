require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Client = require('./data/models/Client');
const Barber = require('./data/models/Barber');
const Service = require('./data/models/Service');
const Appointment = require('./data/models/Appointment');
const Cashier = require('./data/models/Cashier');

// Helper to format date as YYYY-MM-DD
const formatDate = (date) => {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().split('T')[0];
};

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/elbraddock');
    console.log('MongoDB Connected for Advanced Seeding');

    // 0. Clear existing data
    await Client.deleteMany({});
    await Barber.deleteMany({});
    await Service.deleteMany({});
    await Appointment.deleteMany({});
    await Cashier.deleteMany({});
    console.log('Cleared all collections (Clients, Barbers, Services, Appointments, Cashier)');

    // Common password "123456" for all mock users
    const salt = await bcrypt.genSalt(10);
    const mockPassword = await bcrypt.hash('123456', salt);

    // 1. Create Services
    const services = await Service.insertMany([
      { name: 'Corte Degradê', price: 45, duration: 40, active: true },
      { name: 'Corte Social', price: 40, duration: 30, active: true },
      { name: 'Barba Terapia', price: 35, duration: 30, active: true },
      { name: 'Corte + Barba', price: 70, duration: 60, active: true },
      { name: 'Luzes / Platinado', price: 120, duration: 90, active: true },
      { name: 'Sobrancelha', price: 15, duration: 15, active: true },
    ]);
    console.log(`Inserted ${services.length} Services.`);

    // 2. Create Barbers
    const barbers = await Barber.insertMany([
      { 
        name: 'Wellington Braddock', 
        phone: '21999999999', 
        password: mockPassword, 
        specialties: ['Degradê', 'Barba', 'Pigmentação'],
        active: true,
        role: 'admin'
      },
      { 
        name: 'Lucas Barber', 
        phone: '21888888888', 
        password: mockPassword, 
        specialties: ['Social', 'Platinado'],
        active: true,
        role: 'barber'
      }
    ]);
    console.log(`Inserted ${barbers.length} Barbers.`);

    // 3. Create Clients
    const clientData = [];
    for (let i = 1; i <= 20; i++) {
        clientData.push({
            name: `Cliente Silva ${i}`,
            phone: `219000000${i.toString().padStart(2, '0')}`,
            password: mockPassword,
            total_cuts: Math.floor(Math.random() * 8) + 1, // Random past cuts for ranking
            active: true
        });
    }
    const clients = await Client.insertMany(clientData);
    console.log(`Inserted ${clients.length} Clients.`);

    // 4. Create Appointments
    const appointmentsData = [];
    const times = ['09:00', '09:30', '10:00', '10:30', '11:00', '14:00', '15:00', '16:00', '17:30'];
    const today = new Date();

    // Past Appointments (last 30 days) - Status: 'completed'
    for (let i = 0; i < 50; i++) {
        const pastDate = new Date();
        pastDate.setDate(today.getDate() - Math.floor(Math.random() * 30) - 1);
        
        const rClient = clients[Math.floor(Math.random() * clients.length)];
        const rBarber = barbers[Math.floor(Math.random() * barbers.length)];
        const rService = services[Math.floor(Math.random() * services.length)];
        const rTime = times[Math.floor(Math.random() * times.length)];

        appointmentsData.push({
            client_id: rClient._id,
            barber_id: rBarber._id,
            service: rService._id,
            date: formatDate(pastDate),
            time: rTime,
            price: rService.price,
            status: 'completed',
            created_at: pastDate
        });
    }

    // Future Appointments (next 7 days) - Status: 'pending'
    for (let i = 0; i < 20; i++) {
        const futureDate = new Date();
        futureDate.setDate(today.getDate() + Math.floor(Math.random() * 7) + 1);
        
        const rClient = clients[Math.floor(Math.random() * clients.length)];
        const rBarber = barbers[Math.floor(Math.random() * barbers.length)];
        const rService = services[Math.floor(Math.random() * services.length)];
        const rTime = times[Math.floor(Math.random() * times.length)];

        appointmentsData.push({
            client_id: rClient._id,
            barber_id: rBarber._id,
            service: rService._id,
            date: formatDate(futureDate),
            time: rTime,
            price: rService.price,
            status: 'pending'
        });
    }

    // Today's Appointments - Status: mixed
    for (let i = 0; i < 8; i++) {
        const rClient = clients[Math.floor(Math.random() * clients.length)];
        const rBarber = barbers[Math.floor(Math.random() * barbers.length)];
        const rService = services[Math.floor(Math.random() * services.length)];
        const rTime = times[Math.floor(Math.random() * times.length)];
        const status = Math.random() > 0.5 ? 'completed' : 'pending';

        appointmentsData.push({
            client_id: rClient._id,
            barber_id: rBarber._id,
            service: rService._id,
            date: formatDate(today),
            time: rTime,
            price: rService.price,
            status: status
        });
    }

    const appointments = await Appointment.insertMany(appointmentsData);
    console.log(`Inserted ${appointments.length} Appointments (Past, Today, Future).`);

    // 5. Create Cashier Entries (Finances)
    const cashierData = [];
    
    // Convert completed appointments to cash flow Income
    appointments.filter(a => a.status === 'completed').forEach(appt => {
        cashierData.push({
            type: 'entrada',
            amount: appt.price,
            description: `Corte/Serviço no dia ${appt.date} às ${appt.time}`,
            payment_method: ['pix', 'cartao', 'dinheiro'][Math.floor(Math.random() * 3)],
            date: new Date(appt.date)
        });
    });

    // Add some random business expenses to make charts realistic
    for (let i = 0; i < 10; i++) {
        const expenseDate = new Date();
        expenseDate.setDate(today.getDate() - Math.floor(Math.random() * 30));
        
        const expenseTypes = [
            { desc: 'Compra de Lâminas / Pomada', range: [30, 150] },
            { desc: 'Conta de Energia', range: [200, 350] },
            { desc: 'Marketing Instagram', range: [50, 100] },
            { desc: 'Material de Limpeza', range: [20, 60] }
        ];
        const rExpense = expenseTypes[Math.floor(Math.random() * expenseTypes.length)];
        const amount = Math.floor(Math.random() * (rExpense.range[1] - rExpense.range[0])) + rExpense.range[0];

        cashierData.push({
            type: 'saida',
            amount: amount,
            description: rExpense.desc,
            payment_method: 'pix',
            date: expenseDate
        });
    }

    await Cashier.insertMany(cashierData);
    console.log(`Inserted ${cashierData.length} Cashier Entries (Income and Expenses).`);

    console.log('');
    console.log('✅ DATABASE FULLY SEEDED WITH MOCK DATA FOR CHARTS! ✅');
    console.log('Admin Account -> Phone: 21999999999 | Pass: 123456');
    console.log('Client Accounts -> Phone: 21900000001 (to 20) | Pass: 123456');
    process.exit();

  } catch (error) {
    console.error('Seeder Error:', error);
    process.exit(1);
  }
};

seedDB();
