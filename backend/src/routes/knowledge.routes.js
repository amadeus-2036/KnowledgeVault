const express = require('express');
const { ingestUrl } = require('../controllers/knowledge.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);

router.post('/ingest', ingestUrl);

module.exports = router;
