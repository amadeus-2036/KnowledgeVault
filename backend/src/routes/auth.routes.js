// src/routes/auth.routes.js
const { Router } = require('express');
const { register, login, getMe, updateMe } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);

module.exports = router;
