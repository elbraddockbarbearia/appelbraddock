require('dotenv').config();
const mongoose = require('mongoose');
const Client = require('./data/models/Client');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const phone = '21900000008';
  const plainPassword = '123456';
  
  const client = await Client.findOne({ phone }).select('+password');
  if (!client) {
    console.log(`Client not found with phone: ${phone}`);
    process.exit(0);
  }
  
  console.log('Client found:', client.name);
  console.log('Stored hashed password:', client.password);
  
  const isMatch = await client.matchPassword(plainPassword);
  console.log(`Does password "${plainPassword}" match?`, isMatch);
  
  // Test trimming or spaces
  const phone2 = '21900000008 ';
  const c2 = await Client.findOne({ phone: phone2.trim() });
  console.log('Found with trim?', !!c2);

  process.exit(0);
});
