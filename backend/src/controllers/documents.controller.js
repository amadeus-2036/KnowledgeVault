// src/controllers/documents.controller.js
// Handles file upload, text extraction, and AI processing pipeline.
// Interview points:
// - Multer middleware populates req.file with file metadata
// - pdf-parse extracts raw text from PDFs — enables AI and search
// - Same setImmediate async pattern as notes for non-blocking AI processing
// - processingStatus field lets frontend poll or display loading state

const fs = require('fs');
const path = require('path');
const Document = require('../models/Document.model');
const Tag = require('../models/Tag.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { generateEmbedding, generateSummary, generateTags } = require('../services/ai.service');

// In-memory lock to prevent duplicate AI requests
const deduplicationLock = new Map();

// Extract text from uploaded file
const extractText = async (filePath, fileType) => {
  if (fileType === 'txt') {
    return fs.readFileSync(filePath, 'utf-8');
  }
  if (fileType === 'pdf') {
    const pdfParse = require('pdf-parse');
    const buffer = fs.readFileSync(filePath);
    const data = await pdfParse(buffer);
    return data.text;
  }
  return '';
};

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

// GET /api/documents
const getDocuments = asyncHandler(async (req, res) => {
  const { page = 1, limit = 12, tag } = req.query;
  const query = { user: req.user._id };
  if (req.query.repository) query.repository = req.query.repository;
  if (tag) query.tags = tag;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [documents, total] = await Promise.all([
    Document.find(query)
      .populate('tags', 'name color')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Document.countDocuments(query),
  ]);

  res.status(200).json(
    new ApiResponse(200, {
      documents,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / parseInt(limit)) },
    })
  );
});

// GET /api/documents/:id
const getDocumentById = asyncHandler(async (req, res) => {
  const doc = await Document.findOne({ _id: req.params.id, user: req.user._id })
    .populate('tags', 'name color')
    .select('+extractedText');
  if (!doc) throw new ApiError(404, 'Document not found');
  res.status(200).json(new ApiResponse(200, doc));
});

// POST /api/documents  (multipart/form-data)
const uploadDocument = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'No file uploaded');

  const { originalname, filename, path: filePath, size, mimetype } = req.file;
  const fileType = path.extname(originalname).replace('.', '').toLowerCase();
  const { name, tags: tagIds, repository } = req.body;

  const doc = await Document.create({
    name: name || originalname,
    originalName: originalname,
    fileType,
    fileSize: size,
    filePath,
    user: req.user._id,
    tags: tagIds ? (Array.isArray(tagIds) ? tagIds : [tagIds]) : [],
    repository: repository || null,
    processingStatus: 'pending',
  });

  // Respond immediately — AI processing is async
  res.status(201).json(new ApiResponse(201, doc, 'Document uploaded, AI processing started'));

  // Background: extract text → generate embedding, summary, tags
  setImmediate(async () => {
    try {
      await Document.findByIdAndUpdate(doc._id, { processingStatus: 'processing' });
      const extractedText = await extractText(filePath, fileType);

      const embedding = await generateEmbedding(extractedText);

      await Document.findByIdAndUpdate(doc._id, {
        extractedText,
        embedding,
        processingStatus: 'completed',
      });
    } catch (err) {
      console.error('Document AI processing failed:', err.message);
      await Document.findByIdAndUpdate(doc._id, { processingStatus: 'failed' });
    }
  });
});

// DELETE /api/documents/:id
const deleteDocument = asyncHandler(async (req, res) => {
  const doc = await Document.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!doc) throw new ApiError(404, 'Document not found');

  // Delete the actual file from disk
  try {
    fs.unlinkSync(doc.filePath);
  } catch (e) {
    console.error('File deletion failed:', e.message);
  }

  res.status(200).json(new ApiResponse(200, null, 'Document deleted'));
});

// POST /api/documents/:id/summary
const generateDocumentSummary = asyncHandler(async (req, res) => {
  const { forceRefresh } = req.query;
  const lockKey = `summary:doc:${req.params.id}`;

  if (deduplicationLock.has(lockKey)) {
    return res.status(202).json(new ApiResponse(202, { status: 'generating' }, 'Summary generation already in progress'));
  }

  const doc = await Document.findOne({ _id: req.params.id, user: req.user._id }).select('+extractedText');
  if (!doc) throw new ApiError(404, 'Document not found');
  if (!doc.extractedText) throw new ApiError(400, 'Document has no text to summarize');

  if (doc.summaryStatus === 'available' && doc.aiSummary && forceRefresh !== 'true') {
    return res.status(200).json(new ApiResponse(200, { summary: doc.aiSummary }, 'Cached summary retrieved'));
  }

  deduplicationLock.set(lockKey, true);
  doc.summaryStatus = 'generating';
  await doc.save();

  try {
    const summary = await generateSummary(doc.extractedText);
    doc.aiSummary = summary;
    doc.summaryStatus = 'available';
    await doc.save();
    res.status(200).json(new ApiResponse(200, { summary }, 'Summary generated'));
  } catch (error) {
    doc.summaryStatus = 'failed';
    await doc.save();
    throw new ApiError(500, 'Failed to generate summary');
  } finally {
    deduplicationLock.delete(lockKey);
  }
});

// POST /api/documents/:id/tags
const generateDocumentTags = asyncHandler(async (req, res) => {
  const { forceRefresh } = req.query;
  const lockKey = `tags:doc:${req.params.id}`;

  if (deduplicationLock.has(lockKey)) {
    return res.status(202).json(new ApiResponse(202, { status: 'generating' }, 'Tag generation already in progress'));
  }

  const doc = await Document.findOne({ _id: req.params.id, user: req.user._id }).select('+extractedText').populate('tags', 'name color');
  if (!doc) throw new ApiError(404, 'Document not found');
  if (!doc.extractedText) throw new ApiError(400, 'Document has no text to tag');

  if (doc.tagStatus === 'available' && doc.tags.length > 0 && forceRefresh !== 'true') {
    return res.status(200).json(new ApiResponse(200, doc.tags, 'Cached tags retrieved'));
  }

  deduplicationLock.set(lockKey, true);

  const docModel = await Document.findById(doc._id).select('+extractedText');
  docModel.tagStatus = 'generating';
  await docModel.save();

  try {
    const aiTagNames = await generateTags(`${docModel.name}\n\n${docModel.extractedText}`);
    const aiTagIds = aiTagNames.length > 0 ? await upsertTags(aiTagNames, req.user._id) : [];
    
    const allTags = [...new Set([...(docModel.tags.map(String)), ...aiTagIds.map(String)])];
    docModel.tags = allTags;
    docModel.tagStatus = 'available';
    await docModel.save();

    const populated = await docModel.populate('tags', 'name color');
    res.status(200).json(new ApiResponse(200, populated.tags, 'Tags generated'));
  } catch (error) {
    docModel.tagStatus = 'failed';
    await docModel.save();
    throw new ApiError(500, 'Failed to generate tags');
  } finally {
    deduplicationLock.delete(lockKey);
  }
});

module.exports = { getDocuments, getDocumentById, uploadDocument, deleteDocument, generateDocumentSummary, generateDocumentTags };
