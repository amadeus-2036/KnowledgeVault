const mongoose = require('mongoose');

const repositorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Repository name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    themeColor: {
      type: String,
      default: 'blue',
    },
  },
  {
    timestamps: true,
  }
);

// Optional: Ensure repository names are unique per user
repositorySchema.index({ user: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Repository', repositorySchema);
