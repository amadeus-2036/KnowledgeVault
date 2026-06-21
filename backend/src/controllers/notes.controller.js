// src/controllers/notes.controller.js
// Full CRUD for notes + AI-powered embedding and tag generation on create/update.
// Interview points:
// - Pagination: page/limit query params with Math.ceil for totalPages
// - Embedding generated asynchronously after save — doesn't block the response
// - AI tag auto-generation: we create Tag documents if they don't exist (upsert pattern)
// - User scoping: every query includes user: req.user._id for data isolation

const Note = require('../models/Note.model');
const Tag = require('../models/Tag.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { generateEmbedding, generateSummary, generateTags } = require('../services/ai.service');

// Helper: upsert tags by name for a user
const upsertTags = async (tagNames, userId) => {
  const tagDocs = await Promise.all(
    tagNames.map((name) =>
      Tag.findOneAndUpdate(
        { name: name.toLowerCase().trim(), user: userId },
        { name: name.toLowerCase().trim(), user: userId },
        { upsert: true, new: true }
      )
    )
  );
  return tagDocs.map((t) => t._id);
};

// GET /api/notes
const getNotes = asyncHandler(async (req, res) => {
  const { page = 1, limit = 12, tag, search, pinned } = req.query;

  const query = { user: req.user._id };

  if (req.query.repository) query.repository = req.query.repository;
  if (tag) query.tags = tag;
  if (pinned === 'true') query.isPinned = true;
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { content: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [notes, total] = await Promise.all([
    Note.find(query)
      .populate('tags', 'name color')
      .sort({ isPinned: -1, updatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Note.countDocuments(query),
  ]);

  res.status(200).json(
    new ApiResponse(200, {
      notes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    })
  );
});

// GET /api/notes/:id
const getNoteById = asyncHandler(async (req, res) => {
  const note = await Note.findOne({
    _id: req.params.id,
    user: req.user._id,
  }).populate('tags', 'name color');

  if (!note) throw new ApiError(404, 'Note not found');

  res.status(200).json(new ApiResponse(200, note));
});

// POST /api/notes
const createNote = asyncHandler(async (req, res) => {
  const { title, content, tags: tagIds, isPinned, repository } = req.body;

  if (!title || !content) throw new ApiError(400, 'Title and content are required');

  const note = await Note.create({
    title,
    content,
    user: req.user._id,
    tags: tagIds || [],
    isPinned: isPinned || false,
    repository: repository || null,
  });

  // AI operations run after response — non-blocking
  // In production: use a job queue (BullMQ) for this
  setImmediate(async () => {
    try {
      const embedding = await generateEmbedding(`${title}\n\n${content}`);

      await Note.findByIdAndUpdate(note._id, { embedding });
    } catch (err) {
      console.error('Background AI processing for note failed:', err.message);
    }
  });

  const populated = await note.populate('tags', 'name color');
  res.status(201).json(new ApiResponse(201, populated, 'Note created'));
});

// PUT /api/notes/:id
const updateNote = asyncHandler(async (req, res) => {
  const { title, content, tags: tagIds, isPinned } = req.body;

  const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
  if (!note) throw new ApiError(404, 'Note not found');

  const updated = await Note.findByIdAndUpdate(
    req.params.id,
    { title, content, tags: tagIds, isPinned },
    { new: true, runValidators: true }
  ).populate('tags', 'name color');

  // Regenerate embedding if content changed
  if (content || title) {
    setImmediate(async () => {
      try {
        const embedding = await generateEmbedding(
          `${updated.title}\n\n${updated.content}`
        );
        await Note.findByIdAndUpdate(updated._id, { embedding });
      } catch (err) {
        console.error('Embedding update failed:', err.message);
      }
    });
  }

  res.status(200).json(new ApiResponse(200, updated, 'Note updated'));
});

// DELETE /api/notes/:id
const deleteNote = asyncHandler(async (req, res) => {
  const note = await Note.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id,
  });
  if (!note) throw new ApiError(404, 'Note not found');
  res.status(200).json(new ApiResponse(200, null, 'Note deleted'));
});

// PATCH /api/notes/:id/pin
const togglePin = asyncHandler(async (req, res) => {
  const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
  if (!note) throw new ApiError(404, 'Note not found');

  note.isPinned = !note.isPinned;
  await note.save();

  res.status(200).json(new ApiResponse(200, note, 'Pin status updated'));
});

// POST /api/notes/:id/summary
const generateNoteSummary = asyncHandler(async (req, res) => {
  const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
  if (!note) throw new ApiError(404, 'Note not found');

  const summary = await generateSummary(note.content);
  note.aiSummary = summary;
  await note.save();

  res.status(200).json(new ApiResponse(200, { summary }, 'Summary generated'));
});

// POST /api/notes/:id/tags
const generateNoteTags = asyncHandler(async (req, res) => {
  const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
  if (!note) throw new ApiError(404, 'Note not found');

  const aiTagNames = await generateTags(`${note.title}\n\n${note.content}`);
  const aiTagIds = aiTagNames.length > 0 ? await upsertTags(aiTagNames, req.user._id) : [];
  
  const allTags = [...new Set([...(note.tags.map(String)), ...aiTagIds.map(String)])];
  note.tags = allTags;
  await note.save();

  const populated = await note.populate('tags', 'name color');
  res.status(200).json(new ApiResponse(200, populated.tags, 'Tags generated'));
});

module.exports = { getNotes, getNoteById, createNote, updateNote, deleteNote, togglePin, generateNoteSummary, generateNoteTags };
