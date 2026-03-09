const Settings = require('../../data/models/Settings');

// Get settings
const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne({});
    if (!settings) {
      settings = await Settings.create({}); // Create default
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update settings (Admin only)
const updateSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne({});
    if (!settings) {
      settings = new Settings();
    }

    // Update fields
    if (req.body.operating_hours) settings.operating_hours = req.body.operating_hours;
    if (req.body.interval_minutes) settings.interval_minutes = req.body.interval_minutes;
    if (req.body.loyalty) settings.loyalty = req.body.loyalty;

    const updatedSettings = await settings.save();
    res.json(updatedSettings);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getSettings,
  updateSettings
};
