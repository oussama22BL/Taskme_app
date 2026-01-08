const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');

// All endpoints require auth
router.get('/', authMiddleware, reportController.listReports);
router.get('/:id', authMiddleware, reportController.getReport);
router.post('/', authMiddleware, reportController.createReport);
router.put('/:id', authMiddleware, reportController.updateReport);
// delete restricted to admin/superAdmin
router.delete('/:id', authMiddleware, requireRole('admin','superAdmin'), reportController.deleteReport);

// Attachments upload (PDF/CSV allowed)
const upload = require('../middleware/uploadMiddleware');
router.post('/:id/attachments', authMiddleware, upload.single('file'), reportController.uploadAttachment);

// Export report as csv or pdf: /api/reports/:id/export?format=csv|pdf
router.get('/:id/export', authMiddleware, reportController.exportReport);

module.exports = router;
