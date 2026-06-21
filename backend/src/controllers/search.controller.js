// src/controllers/search.controller.js
// Handles hybrid search (full-text + semantic) and Ask My Vault.
const { fullTextSearch, semanticSearch } = require('../services/search.service');
const { askWithContext, generateInsights } = require('../services/ai.service');
const Note = require('../models/Note.model');
const Document = require('../models/Document.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

const search = asyncHandler(async (req, res) => {
  const { q, type = 'text', repository } = req.query;
  if (!q || q.trim().length < 2) throw new ApiError(400, 'Search query must be at least 2 characters');

  let results;
  if (type === 'semantic') {
    results = await semanticSearch(q, req.user._id, repository);
  } else {
    results = await fullTextSearch(q, req.user._id, repository);
  }

  res.status(200).json(new ApiResponse(200, results));
});

// POST /api/ai/ask  { question: string }
// Interview point: This is the RAG (Retrieval-Augmented Generation) endpoint.
// Step 1: Convert question to embedding vector
// Step 2: Find semantically similar notes/docs in Atlas Vector Search
// Step 3: Inject those results as context into Gemini prompt
// Step 4: Return Gemini's grounded answer
const askVault = asyncHandler(async (req, res) => {
  const { question, repository } = req.body;
  if (!question || question.trim().length < 3) {
    throw new ApiError(400, 'Question is required');
  }

  // Step 1 + 2: Retrieve semantically similar content
  let { notes, documents } = await semanticSearch(question, req.user._id, repository);

  // Fallback to fullTextSearch if vector search returns nothing (e.g. index not built)
  if (notes.length === 0 && documents.length === 0) {
    const fullTextResults = await require('../services/search.service').fullTextSearch(question, req.user._id, repository);
    notes = fullTextResults.notes;
    documents = fullTextResults.documents;
  }

  // Combine and format context
  const contextChunks = [
    ...notes.map((n) => ({ title: n.title, content: n.content })),
    ...documents.map((d) => ({ title: d.name, content: d.aiSummary })),
  ].slice(0, 5); // Limit context size

  if (contextChunks.length === 0) {
    return res.status(200).json(
      new ApiResponse(200, {
        answer: repository 
          ? "I couldn't find any relevant information in this vault. Try asking something else or adding more documents to this vault."
          : "I couldn't find any relevant information in your vault. Try adding some notes or documents first!",
        sources: [],
      })
    );
  }

  // Step 3 + 4: Generate answer with context
  const answer = await askWithContext(question, contextChunks);

  res.status(200).json(
    new ApiResponse(200, {
      answer,
      sources: [...notes, ...documents].slice(0, 5),
    })
  );
});

// GET /api/ai/insights
const getInsights = asyncHandler(async (req, res) => {
  const [recentNotes, recentDocs] = await Promise.all([
    Note.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(15).select('title content'),
    Document.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(10).select('name aiSummary'),
  ]);

  const insights = await generateInsights(
    recentNotes.map((n) => ({ title: n.title, content: n.content })),
    recentDocs.map((d) => ({ title: d.name, content: d.aiSummary }))
  );

  res.status(200).json(new ApiResponse(200, insights));
});

// GET /api/dashboard/stats
const getDashboardStats = asyncHandler(async (req, res) => {
  const [notesCount, documentsCount, recentNotes, recentDocs] = await Promise.all([
    Note.countDocuments({ user: req.user._id }),
    Document.countDocuments({ user: req.user._id }),
    Note.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(5).populate('tags', 'name color'),
    Document.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(5).populate('tags', 'name color'),
  ]);

  res.status(200).json(
    new ApiResponse(200, {
      counts: { notes: notesCount, documents: documentsCount },
      recentActivity: [
        ...recentNotes.map((n) => ({ ...n.toObject(), type: 'note' })),
        ...recentDocs.map((d) => ({ ...d.toObject(), type: 'document' })),
      ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 8),
    })
  );
});

// POST /api/extension/suggest-repo
const suggestRepositoryController = asyncHandler(async (req, res) => {
  const { title, url } = req.body;
  if (!title && !url) throw new ApiError(400, 'Title or URL is required');

  const Repository = require('../models/Repository.model');
  const repositories = await Repository.find({ user: req.user._id });
  
  if (repositories.length === 0) {
    return res.status(200).json(new ApiResponse(200, { repositoryId: null }));
  }

  const { suggestRepository } = require('../services/ai.service');
  const repositoryId = await suggestRepository(title, url, repositories);

  res.status(200).json(new ApiResponse(200, { repositoryId }));
});

module.exports = { search, askVault, getInsights, getDashboardStats, suggestRepositoryController };
