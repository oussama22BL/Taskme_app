const Report = require('../models/Report');
const mongoose = require('mongoose');

// Create a new report (admin only)
exports.createReport = async (req, res) => {
  try {
    if (!(req.user.role === 'admin' || req.user.role === 'superAdmin')) {
      return res.status(403).json({ msg: 'Forbidden' });
    }

    const data = req.body;
    const report = new Report({ ...data, author: req.user._id });
    await report.save();
    return res.status(201).json(report);
  } catch (err) {
    console.error('createReport error', err);
    return res.status(500).json({ msg: 'Server error', error: err?.message || String(err) });
  }
};

// List reports with filters and permission enforcement
exports.listReports = async (req, res) => {
  try {
    const { type, author, targetUser, tag, from, to, status } = req.query;

    const filters = {};
    if (type) filters.type = type;
    if (author) filters.author = author;
    if (targetUser) filters.targetUser = targetUser;
    if (tag) filters.tags = tag;
    if (status) filters.status = status;
    if (from || to) {
      filters.createdAt = {};
      if (from) filters.createdAt.$gte = new Date(from);
      if (to) filters.createdAt.$lte = new Date(to);
    }

    // Permission: admins see everything; non-admins see only individual reports where they are author or targetUser
    if (!(req.user.role === 'admin' || req.user.role === 'superAdmin')) {
      filters.$or = [
        { type: 'individual', author: req.user._id },
        { type: 'individual', targetUser: req.user._id }
      ];
    }

    const reports = await Report.find(filters).sort({ createdAt: -1 }).populate('author', 'nom prenom').lean();
    res.json(reports);
  } catch (err) {
    console.error('listReports error', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Get a single report with permission checks
exports.getReport = async (req, res) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ msg: 'Invalid id' });

    const report = await Report.findById(id).populate('author', 'nom prenom email');
    if (!report) return res.status(404).json({ msg: 'Report not found' });

    // Permission checks
    if (report.type === 'global' && !(req.user.role === 'admin' || req.user.role === 'superAdmin')) {
      return res.status(403).json({ msg: 'Forbidden' });
    }

    if (report.type === 'individual') {
      const isAllowed = String(report.author._id) === String(req.user._id) || String(report.targetUser) === String(req.user._id) || req.user.role === 'admin' || req.user.role === 'superAdmin';
      if (!isAllowed) return res.status(403).json({ msg: 'Forbidden' });
    }

    res.json(report);
  } catch (err) {
    console.error('getReport error', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Update a report (only author or admin)
exports.updateReport = async (req, res) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ msg: 'Invalid id' });

    const report = await Report.findById(id);
    if (!report) return res.status(404).json({ msg: 'Report not found' });

    if (String(report.author) !== String(req.user._id) && !(req.user.role === 'admin' || req.user.role === 'superAdmin')) {
      return res.status(403).json({ msg: 'Forbidden' });
    }

    const updated = await Report.findByIdAndUpdate(id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    console.error('updateReport error', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Delete (admin only)
exports.deleteReport = async (req, res) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ msg: 'Invalid id' });

    if (!(req.user.role === 'admin' || req.user.role === 'superAdmin')) return res.status(403).json({ msg: 'Forbidden' });

    await Report.findByIdAndDelete(id);
    res.json({ msg: 'Report deleted' });
  } catch (err) {
    console.error('deleteReport error', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Upload an attachment (PDF or CSV) to a report
exports.uploadAttachment = async (req, res) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ msg: 'Invalid id' });

    const report = await Report.findById(id);
    if (!report) return res.status(404).json({ msg: 'Report not found' });

    // Only author or admin can attach files
    if (String(report.author) !== String(req.user._id) && !(req.user.role === 'admin' || req.user.role === 'superAdmin')) {
      return res.status(403).json({ msg: 'Forbidden' });
    }

    if (!req.file) return res.status(400).json({ msg: 'No file uploaded' });

    const fileUrl = `/uploads/${req.file.filename}`;
    report.attachments = report.attachments || [];
    report.attachments.push({ url: fileUrl, name: req.file.originalname, size: req.file.size });
    await report.save();

    res.json({ msg: 'Attachment uploaded', attachment: report.attachments[report.attachments.length - 1] });
  } catch (err) {
    console.error('uploadAttachment error', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Export report as CSV or PDF
exports.exportReport = async (req, res) => {
  try {
    const id = req.params.id;
    const { format = 'csv' } = req.query;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ msg: 'Invalid id' });

    const report = await Report.findById(id).lean();
    if (!report) return res.status(404).json({ msg: 'Report not found' });

    // Permission: same as getReport
    if (report.type === 'global' && !(req.user.role === 'admin' || req.user.role === 'superAdmin')) {
      return res.status(403).json({ msg: 'Forbidden' });
    }

    // For CSV: flatten some fields into rows
    if (format === 'csv') {
      const { Parser } = require('json2csv');
      const rows = [];
      // tasks
      if (report.tasks && report.tasks.length) {
        report.tasks.forEach((t, idx) => rows.push({ section: 'task', index: idx + 1, status: t.status, hours: t.hours }));
      }
      // assignments
      if (report.assignments && report.assignments.length) {
        report.assignments.forEach((a, idx) => rows.push({ section: 'assignment', index: idx + 1, vehicleId: a.vehicleId, from: a.from, to: a.to, assignedTo: a.assignedTo }));
      }
      // refusals
      if (report.refusals && report.refusals.length) {
        report.refusals.forEach((r, idx) => rows.push({ section: 'refusal', index: idx + 1, by: r.by, reason: r.reason, date: r.date }));
      }

      // if no detailed rows, export summary line
      if (rows.length === 0) {
        rows.push({ section: 'summary', title: report.title, type: report.type, status: report.status, createdAt: report.createdAt });
      }

      const parser = new Parser({ fields: Object.keys(rows[0]) });
      const csv = parser.parse(rows);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="report-${id}.csv"`);
      return res.send(csv);
    }

    if (format === 'pdf') {
      const PDFDocument = require('pdfkit');
      const doc = new PDFDocument();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="report-${id}.pdf"`);
      doc.pipe(res);
      doc.fontSize(18).text(report.title, { underline: true });
      doc.moveDown();
      doc.fontSize(12).text(`Type: ${report.type}`);
      doc.text(`Status: ${report.status}`);
      if (report.period) doc.text(`Period: ${report.period.from || ''} - ${report.period.to || ''}`);
      doc.moveDown();
      if (report.tasks && report.tasks.length) {
        doc.text('Tasks:', { underline: true });
        report.tasks.forEach((t, i) => doc.text(`${i + 1}. status=${t.status}, hours=${t.hours}`));
        doc.moveDown();
      }
      if (report.assignments && report.assignments.length) {
        doc.text('Assignments:', { underline: true });
        report.assignments.forEach((a, i) => doc.text(`${i + 1}. vehicle=${a.vehicleId}, from=${a.from}, to=${a.to}, assignedTo=${a.assignedTo}`));
        doc.moveDown();
      }
      if (report.refusals && report.refusals.length) {
        doc.text('Refusals:', { underline: true });
        report.refusals.forEach((r, i) => doc.text(`${i + 1}. by=${r.by}, reason=${r.reason}, date=${r.date}`));
        doc.moveDown();
      }
      doc.end();
      return;
    }

    return res.status(400).json({ msg: 'Unsupported format' });
  } catch (err) {
    console.error('exportReport error', err);
    res.status(500).json({ msg: 'Server error' });
  }
};
