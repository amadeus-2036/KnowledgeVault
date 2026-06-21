// src/routes/documents.routes.js
const { Router } = require('express');
const {
  getDocuments,
  getDocumentById,
  uploadDocument,
  deleteDocument,
  generateDocumentSummary,
  generateDocumentTags
} = require('../controllers/documents.controller');
const { protect } = require('../middleware/auth.middleware');
const { upload } = require('../middleware/upload.middleware');

const router = Router();

router.use(protect);

router.get('/', getDocuments);
// upload.single('file') parses the multipart form and attaches req.file
router.post('/', upload.single('file'), uploadDocument);
router.get('/:id', getDocumentById);
router.delete('/:id', deleteDocument);
router.post('/:id/summary', generateDocumentSummary);
router.post('/:id/tags', generateDocumentTags);

module.exports = router;
