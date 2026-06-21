const Repository = require('../models/Repository.model');
const Note = require('../models/Note.model');
const Document = require('../models/Document.model');

/**
 * @desc    Get all repositories for the logged-in user
 * @route   GET /api/repositories
 */
const getRepositories = async (req, res, next) => {
  try {
    const repositories = await Repository.find({ user: req.user._id }).sort({ updatedAt: -1 }).lean();
    
    // Add resource counts for each repository
    const enrichedRepos = await Promise.all(
      repositories.map(async (repo) => {
        const noteCount = await Note.countDocuments({ repository: repo._id });
        const docCount = await Document.countDocuments({ repository: repo._id });
        return {
          ...repo,
          resourceCount: noteCount + docCount,
          lastActivity: repo.updatedAt
        };
      })
    );

    res.status(200).json({ success: true, count: enrichedRepos.length, data: enrichedRepos });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single repository by ID
 * @route   GET /api/repositories/:id
 */
const getRepository = async (req, res, next) => {
  try {
    const repository = await Repository.findOne({ _id: req.params.id, user: req.user._id });
    if (!repository) {
      return res.status(404).json({ success: false, message: 'Repository not found' });
    }
    res.status(200).json({ success: true, data: repository });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new repository
 * @route   POST /api/repositories
 */
const createRepository = async (req, res, next) => {
  try {
    const { name, description, themeColor, icon, coverImage } = req.body;
    
    // Check if repo with same name exists for this user
    const existingRepo = await Repository.findOne({ user: req.user._id, name: name.trim() });
    if (existingRepo) {
      return res.status(400).json({ success: false, message: 'Repository with this name already exists' });
    }

    const repository = await Repository.create({
      name,
      description,
      themeColor: themeColor || 'blue',
      icon: icon || 'Folder',
      coverImage: coverImage || 'linear-gradient(135deg, var(--color-surface-2), var(--color-surface-3))',
      user: req.user._id,
    });

    res.status(201).json({ success: true, data: repository });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update repository
 * @route   PUT /api/repositories/:id
 */
const updateRepository = async (req, res, next) => {
  try {
    let repository = await Repository.findOne({ _id: req.params.id, user: req.user._id });
    if (!repository) {
      return res.status(404).json({ success: false, message: 'Repository not found' });
    }

    repository = await Repository.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: repository });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete repository
 * @route   DELETE /api/repositories/:id
 */
const deleteRepository = async (req, res, next) => {
  try {
    const repository = await Repository.findOne({ _id: req.params.id, user: req.user._id });
    if (!repository) {
      return res.status(404).json({ success: false, message: 'Repository not found' });
    }

    await repository.deleteOne();
    
    // Disassociate notes and documents
    await Note.updateMany({ repository: repository._id }, { repository: null });
    await Document.updateMany({ repository: repository._id }, { repository: null });

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRepositories,
  getRepository,
  createRepository,
  updateRepository,
  deleteRepository,
};
