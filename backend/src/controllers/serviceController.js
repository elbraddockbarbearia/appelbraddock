const Service = require('../../data/models/Service');

// Get active services (Public - for clients)
// Uses $ne: false so services created before the 'active' field was added are still shown.
const getServices = async (req, res) => {
  try {
    const services = await Service.find({ active: { $ne: false } });
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get ALL services (Admin)
const getServicesAdmin = async (req, res) => {
  try {
    const services = await Service.find({});
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a service (Admin only)
const createService = async (req, res) => {
  try {
    const { name, price, duration } = req.body;
    const service = await Service.create({ name, price, duration });
    res.status(201).json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a service
const updateService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service not found' });

    if (req.body.name !== undefined) service.name = req.body.name;
    if (req.body.price !== undefined) service.price = req.body.price;
    if (req.body.duration !== undefined) service.duration = req.body.duration;
    if (req.body.active !== undefined) service.active = req.body.active;

    const updatedService = await service.save();
    res.json(updatedService);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a service
const deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service not found' });

    await service.deleteOne();
    res.json({ message: 'Service removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getServices,
  getServicesAdmin,
  createService,
  updateService,
  deleteService
};
