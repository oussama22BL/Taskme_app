const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['affectation', 'rappel_24h', 'message'], default: 'affectation' },
    isRead: { type: Boolean, default: false },
    relatedId: { type: mongoose.Schema.Types.ObjectId } // ID de l'affectation ou de la tâche
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);