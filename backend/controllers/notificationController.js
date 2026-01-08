const Notification = require('../models/Notification');

exports.getUserNotifications = async (req, res) => {
  try {
    const notes = await Notification.find({ user: req.user._id }).sort('-createdAt').populate('actor', 'nom prenom email');
    res.json(notes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { read: true });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};
