const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  conversationId: { type: String, required: true, index: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, default: '' },
  read: { type: Boolean, default: false },
  type: { type: String, enum: ['text', 'file', 'system'], default: 'text' },
  fileUrl: { type: String },
  fileName: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', MessageSchema);