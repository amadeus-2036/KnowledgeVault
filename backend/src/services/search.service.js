// src/services/search.service.js
// Implements both full-text and semantic (vector) search.
// Interview points:
// - Full-text search: MongoDB $text operator on indexed fields (fast, keyword-based)
// - Semantic search: $vectorSearch aggregation (meaning-based, finds similar content)
// - We merge and deduplicate results from both methods for hybrid search
// - Semantic search requires a Vector Search index configured in MongoDB Atlas UI

const Note = require('../models/Note.model');
const Document = require('../models/Document.model');
const { generateEmbedding } = require('./ai.service');

/**
 * Full-text search across notes and documents.
 * Uses MongoDB's $text operator on text-indexed fields.
 */
const fullTextSearch = async (query, userId) => {
  const [notes, documents] = await Promise.all([
    Note.find({
      user: userId,
      $text: { $search: query },
    })
      .select({ score: { $meta: 'textScore' }, title: 1, content: 1, tags: 1, createdAt: 1 })
      .sort({ score: { $meta: 'textScore' } })
      .populate('tags', 'name color')
      .limit(10),

    Document.find({
      user: userId,
      name: { $regex: query, $options: 'i' }, // Documents don't have text index on content
    })
      .select('name originalName fileType aiSummary tags createdAt')
      .populate('tags', 'name color')
      .limit(5),
  ]);

  return {
    notes: notes.map((n) => ({ ...n.toObject(), type: 'note' })),
    documents: documents.map((d) => ({ ...d.toObject(), type: 'document' })),
  };
};

/**
 * Semantic search using vector similarity.
 * Interview point: Atlas Vector Search uses HNSW index for approximate nearest neighbor search.
 * This is O(log n) — much faster than brute-force cosine similarity on every document.
 *
 * IMPORTANT: Requires "notes_semantic_index" and "documents_semantic_index" 
 * to be created in MongoDB Atlas UI (see README for setup).
 */
const semanticSearch = async (query, userId) => {
  const queryEmbedding = await generateEmbedding(query);
  if (!queryEmbedding || queryEmbedding.length === 0) {
    return { notes: [], documents: [] };
  }

  const userIdStr = userId.toString();

  const [notes, documents] = await Promise.all([
    Note.aggregate([
      {
        $vectorSearch: {
          index: 'notes_semantic_index',
          path: 'embedding',
          queryVector: queryEmbedding,
          numCandidates: 50,
          limit: 5,
          filter: { user: { $eq: userId } },
        },
      },
      {
        $addFields: { score: { $meta: 'vectorSearchScore' }, type: 'note' },
      },
      {
        $lookup: { from: 'tags', localField: 'tags', foreignField: '_id', as: 'tags' },
      },
      {
        $project: { title: 1, content: 1, tags: 1, createdAt: 1, score: 1, type: 1, aiSummary: 1 },
      },
    ]),

    Document.aggregate([
      {
        $vectorSearch: {
          index: 'documents_semantic_index',
          path: 'embedding',
          queryVector: queryEmbedding,
          numCandidates: 50,
          limit: 5,
          filter: { user: { $eq: userId } },
        },
      },
      {
        $addFields: { score: { $meta: 'vectorSearchScore' }, type: 'document' },
      },
      {
        $lookup: { from: 'tags', localField: 'tags', foreignField: '_id', as: 'tags' },
      },
      {
        $project: { name: 1, originalName: 1, fileType: 1, aiSummary: 1, tags: 1, createdAt: 1, score: 1, type: 1 },
      },
    ]),
  ]);

  return { notes, documents };
};

module.exports = { fullTextSearch, semanticSearch };
