// src/routes/documents.routes.js
const { Router } = require('express');
const {
  getDocuments,
  getDocumentById,
  uploadDocument,
  deleteDocument,
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

module.exports = router;
