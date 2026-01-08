const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', default: null }, // Null si chat général
    content: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);