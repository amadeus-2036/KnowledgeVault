// src/models/Document.model.js
// Interview points:
// - extractedText stores the raw parsed text from PDF/TXT — this is what we embed and search
// - fileType enum enforces valid values at the DB layer
// - Same embedding approach as notes — both types are searchable together
// - fileSize stored in bytes for display purposes

const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      enum: ['pdf', 'txt'],
      required: true,
    },
    fileSize: {
      type: Number, // bytes
      required: true,
    },
    filePath: {
      type: String, // local path for Multer stored file
      required: true,
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
    // Text extracted from the uploaded file (used for AI + search)
    extractedText: {
      type: String,
      default: '',
      select: false, // Large field — only fetch when needed
    },
    aiSummary: {
      type: String,
      default: '',
    },
    // 768-dim vector from Gemini embedding model
    embedding: {
      type: [Number],
      default: [],
      select: false,
    },
    // Processing status for async AI pipeline
    processingStatus: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Document', documentSchema);
