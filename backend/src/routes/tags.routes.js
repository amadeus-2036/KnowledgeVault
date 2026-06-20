// src/routes/tags.routes.js
const { Router } = require('express');
const { getTags, createTag, deleteTag } = require('../controllers/tags.controller');
const { protect } = require('../middleware/auth.middleware');

const router = Router();

router.use(protect);

router.get('/', getTags);
router.post('/', createTag);
router.delete('/:id', deleteTag);

module.exports = router;
