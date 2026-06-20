// src/routes/notes.routes.js
const { Router } = require('express');
const {
  getNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
  togglePin,
} = require('../controllers/notes.controller');
const { protect } = require('../middleware/auth.middleware');

const router = Router();

// All notes routes require authentication
router.use(protect);

router.get('/', getNotes);
router.post('/', createNote);
router.get('/:id', getNoteById);
router.put('/:id', updateNote);
router.delete('/:id', deleteNote);
router.patch('/:id/pin', togglePin);

module.exports = router;
