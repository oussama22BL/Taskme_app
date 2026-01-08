const Notification = require('../models/Notification');
const mongoose = require('mongoose');

// backend/controllers/notificationController.js
exports.getNotifications = async (req, res) => {
    const notifs = await Notification.find({ userId: req.user._id }).sort('-createdAt');
    res.json(notifs);
};

exports.markAsRead = async (req, res) => {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ message: "Succès" });
};

exports.markAllAsRead = async (req, res) => {
    await Notification.updateMany({ userId: req.user._id }, { isRead: true });
    res.json({ message: "Tout est lu" });
};