// src/routes/search.routes.js
const { Router } = require('express');
const { search, askVault, getInsights, getDashboardStats } = require('../controllers/search.controller');
const { protect } = require('../middleware/auth.middleware');

const router = Router();

router.use(protect);

router.get('/search', search);
router.post('/ask', askVault);
router.get('/insights', getInsights);
router.get('/dashboard/stats', getDashboardStats);

module.exports = router;
