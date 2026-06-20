const express = require('express');
const {
  getRepositories,
  getRepository,
  createRepository,
  updateRepository,
  deleteRepository,
} = require('../controllers/repositories.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// All repository routes require authentication
router.use(protect);

router.route('/')
  .get(getRepositories)
  .post(createRepository);

router.route('/:id')
  .get(getRepository)
  .put(updateRepository)
  .delete(deleteRepository);

module.exports = router;
