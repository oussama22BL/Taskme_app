const mongoose = require('mongoose');

const TaskSummarySchema = new mongoose.Schema({
  taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
  status: { type: String },
  hours: { type: Number }
}, { _id: false });

const AssignmentSchema = new mongoose.Schema({
  vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
  from: { type: Date },
  to: { type: Date },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { _id: false });

const AttachmentSchema = new mongoose.Schema({
  url: { type: String },
  name: { type: String },
  size: { type: Number }
}, { _id: false });

const ReportSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  type: { type: String, enum: ['individual', 'global', 'algorithm', 'assignment'], default: 'individual', index: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  period: { from: Date, to: Date },
  tasks: { type: [TaskSummarySchema], default: [] },
  assignments: { type: [AssignmentSchema], default: [] },
  algorithmReports: { type: [mongoose.Schema.Types.Mixed], default: [] },
  refusals: { type: [{ by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, reason: String, date: Date }], default: [] },
  delegations: { type: [{ from: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, to: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, reason: String, date: Date }], default: [] },
  tags: { type: [String], default: [] },
  attachments: { type: [AttachmentSchema], default: [] },
  status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft', index: true },
  metadata: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

module.exports = mongoose.model('Report', ReportSchema);
