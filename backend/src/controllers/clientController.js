const Client = require('../../data/models/Client');
const Appointment = require('../../data/models/Appointment');



// Get all clients (Admin only usually, but let's just make it a standard route)
const getClients = async (req, res) => {
  try {
    const clients = await Client.find({}).sort({ total_cuts: -1 });
    res.json(clients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single client by ID or phone
const getClient = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (client) {
      res.json(client);
    } else {
      res.status(404).json({ message: 'Client not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get inactive clients (>30 days since last appointment or never had one)
const getInactiveClients = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Find appointments older than 30 days
    const recentAppointments = await Appointment.find({
      date: { $gte: thirtyDaysAgo },
      status: { $in: ['completed', 'confirmed'] }
    }).select('client_id');

    const recentClientIds = recentAppointments.map(app => app.client_id);

    // Find clients whose IDs are NOT in the recent list
    const inactiveClients = await Client.find({
      _id: { $nin: recentClientIds }
    }).sort({ total_cuts: -1 });

    // For better experience, we can fetch their last appointment date
    const clientsWithLastAppt = await Promise.all(
      inactiveClients.map(async (client) => {
        const lastAppt = await Appointment.findOne({ 
          client_id: client._id,
          status: { $in: ['completed'] }
        }).sort({ date: -1 });
        
        return {
          ...client._doc,
          last_appointment_date: lastAppt ? lastAppt.date : null
        };
      })
    );

    res.json(clientsWithLastAppt);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get upcoming birthdays (current month)
const getUpcomingBirthdays = async (req, res) => {
  try {
    const today = new Date();
    const currentMonth = today.getMonth() + 1; // 1-12

    // MongoDB doesn't have a direct "extract month" for standard find queries
    // unless using aggregation framework. Let's use aggregation:
    const clients = await Client.aggregate([
      {
        $project: {
          name: 1,
          nickname: 1,
          phone: 1,
          birthday: 1,
          total_cuts: 1,
          points: 1,
          month: { $month: "$birthday" },
          day: { $dayOfMonth: "$birthday" }
        }
      },
      {
        $match: {
          month: currentMonth
        }
      },
      {
        $sort: { day: 1 } // Sort by day of month
      }
    ]);

    res.json(clients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getClients,
  getClient,
  getInactiveClients,
  getUpcomingBirthdays
};
