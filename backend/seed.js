require('dotenv').config();
const mongoose = require('mongoose');
const Service = require('./data/models/Service');
const Barber = require('./data/models/Barber');

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/elbraddock');
    console.log('MongoDB Connected for Seeding');

    // Clear existing to avoid duplicates if run multiple times
    await Service.deleteMany({});
    await Barber.deleteMany({});
    console.log('Cleared existing Services and Barbers');

    // Create Services
    const services = await Service.insertMany([
      { name: 'Corte Degradê', price: 45, duration: 40, active: true },
      { name: 'Corte Social', price: 40, duration: 30, active: true },
      { name: 'Barba Terapia', price: 35, duration: 30, active: true },
      { name: 'Corte + Barba', price: 70, duration: 60, active: true },
      { name: 'Luzes / Platinado', price: 120, duration: 90, active: true },
    ]);
    console.log('Inserted Services:', services.length);

    // Create Barbers
    const barbers = await Barber.insertMany([
      { 
        name: 'Wellington Braddock', 
        phone: '21999999999', 
        password: '$2b$10$XmB0vP/X2U8PzUoD6S.Uye.nTkQGzG8yq.mF9.P5h.l/', // admin123
        specialties: ['Degradê', 'Barba', 'Pigmentação'],
        active: true,
        role: 'admin' // If your model supports this
      },
      { 
        name: 'Lucas Barber', 
        phone: '21888888888', 
        password: '$2b$10$XmB0vP/X2U8PzUoD6S.Uye.nTkQGzG8yq.mF9.P5h.l/', 
        specialties: ['Social', 'Platinado'],
        active: true,
        role: 'barber'
      }
    ]);
    console.log('Inserted Barbers:', barbers.length);

    process.exit();
  } catch (error) {
    console.error('Error with Seeder:', error.message);
    process.exit(1);
  }
};

seedDB();
