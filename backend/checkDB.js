const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/elbraddock', {})
  .then(async () => {
    const clients = await mongoose.connection.db.collection('clients').find().toArray();
    console.log('Clients count:', clients.length);
    clients.forEach(c => {
      console.log(`Phone: ${c.phone}, Pass: ${c.password ? c.password.substring(0, 15) : 'none'}...`);
    });
    mongoose.disconnect();
  })
  .catch(console.error);
