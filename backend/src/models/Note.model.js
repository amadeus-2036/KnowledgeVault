// src/models/Note.model.js
// Interview points:
// - embedding field stores a 768-dimensional vector from Gemini's text-embedding model
//   This is what enables semantic (similarity) search via MongoDB Atlas Vector Search
// - tags is an array of ObjectId references (not embedded strings) so we can query by tag
// - Text index on title+content enables fast full-text search with $text operator
// - isPinned allows users to keep important notes at the top

const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
      maxlength: [5000000, 'Content cannot exceed 5,000,000 characters'],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    tags: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tag',
      },
    ],
    repository: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Repository',
      default: null,
      index: true,
    },
    aiSummary: {
      type: String,
      default: '',
    },
    // 768-dim vector from Gemini embedding-001 model
    // Used by MongoDB Atlas Vector Search
    embedding: {
      type: [Number],
      default: [],
      select: false, // Don't return embeddings in normal queries (large payload)
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Full-text search index — enables $text queries on title and content
noteSchema.index({ title: 'text', content: 'text' });

module.exports = mongoose.model('Note', noteSchema);
