const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // recipient
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // who triggered
    type: { type: String, required: true },
    message: { type: String },
    data: { type: mongoose.Schema.Types.Mixed },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', NotificationSchema);
