// src/models/Tag.model.js
// Interview points:
// - Compound unique index on (user, name) ensures tag names are unique per user
//   (two users can have a tag called "react" — that's fine)
// - Tags are separate documents so they can be referenced by both Notes and Documents

const mongoose = require('mongoose');

const tagSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tag name is required'],
      trim: true,
      lowercase: true,
      maxlength: [30, 'Tag name cannot exceed 30 characters'],
    },
    color: {
      type: String,
      default: '#6366f1', // indigo default
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index: unique tag name per user
tagSchema.index({ user: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Tag', tagSchema);
