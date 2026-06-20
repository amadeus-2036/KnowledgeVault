// src/controllers/tags.controller.js
const Tag = require('../models/Tag.model');
const Note = require('../models/Note.model');
const Document = require('../models/Document.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/tags
const getTags = asyncHandler(async (req, res) => {
  const tags = await Tag.find({ user: req.user._id }).sort({ name: 1 });
  res.status(200).json(new ApiResponse(200, tags));
});

// POST /api/tags
const createTag = asyncHandler(async (req, res) => {
  const { name, color } = req.body;
  if (!name) throw new ApiError(400, 'Tag name is required');

  const tag = await Tag.create({
    name: name.toLowerCase().trim(),
    color: color || '#6366f1',
    user: req.user._id,
  });

  res.status(201).json(new ApiResponse(201, tag, 'Tag created'));
});

// DELETE /api/tags/:id
const deleteTag = asyncHandler(async (req, res) => {
  const tag = await Tag.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!tag) throw new ApiError(404, 'Tag not found');

  // Remove this tag from all notes and documents
  await Promise.all([
    Note.updateMany({ tags: tag._id }, { $pull: { tags: tag._id } }),
    Document.updateMany({ tags: tag._id }, { $pull: { tags: tag._id } }),
  ]);

  res.status(200).json(new ApiResponse(200, null, 'Tag deleted'));
});

module.exports = { getTags, createTag, deleteTag };
