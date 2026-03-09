const Notification = require('../../data/models/Notification');

// Get notifications
const getNotifications = async (req, res) => {
  try {
    const { type, barber_id, limit = 30 } = req.query;
    const filter = {};
    if (type) filter.recipient_type = type;
    if (barber_id) filter.barber_id = barber_id;

    const notifications = await Notification.find(filter)
      .sort({ created_at: -1 })
      .limit(Number(limit));

    const unreadCount = await Notification.countDocuments({ ...filter, read: false });

    res.json({ notifications, unreadCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark one as read
const markRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { read: true });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark ALL as read
const markAllRead = async (req, res) => {
  try {
    const { type, barber_id } = req.body;
    const filter = {};
    if (type) filter.recipient_type = type;
    if (barber_id) filter.barber_id = barber_id;

    await Notification.updateMany({ ...filter, read: false }, { read: true });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper to create a notification (called internally from other controllers)
const createNotification = async ({ recipient_type, barber_id = null, type, message, data = {} }) => {
  try {
    await Notification.create({ recipient_type, barber_id, type, message, data });
  } catch (err) {
    console.error('Failed to create notification:', err.message);
  }
};

module.exports = { getNotifications, markRead, markAllRead, createNotification };
