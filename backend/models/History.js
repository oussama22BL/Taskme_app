const mongoose = require('mongoose');

const HistorySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
    action: { type: String },
    details: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

module.exports = mongoose.model('History', HistorySchema);
