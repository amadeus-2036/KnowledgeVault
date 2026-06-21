// src/routes/extension.routes.js
const { Router } = require('express');
const { protect } = require('../middleware/auth.middleware');
const { suggestRepositoryController } = require('../controllers/search.controller');

const router = Router();

// All extension routes require authentication
router.use(protect);

router.post('/suggest-repo', suggestRepositoryController);

module.exports = router;
