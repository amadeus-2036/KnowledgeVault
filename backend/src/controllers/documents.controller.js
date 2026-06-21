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
  const doc = await Document.findOne({ _id: req.params.id, user: req.user._id }).select('+extractedText');
  if (!doc) throw new ApiError(404, 'Document not found');
  if (!doc.extractedText) throw new ApiError(400, 'Document has no text to summarize');

  const summary = await generateSummary(doc.extractedText);
  doc.aiSummary = summary;
  await doc.save();

  res.status(200).json(new ApiResponse(200, { summary }, 'Summary generated'));
});

// POST /api/documents/:id/tags
const generateDocumentTags = asyncHandler(async (req, res) => {
  const doc = await Document.findOne({ _id: req.params.id, user: req.user._id }).select('+extractedText');
  if (!doc) throw new ApiError(404, 'Document not found');
  if (!doc.extractedText) throw new ApiError(400, 'Document has no text to tag');

  const aiTagNames = await generateTags(`${doc.name}\n\n${doc.extractedText}`);
  const aiTagIds = aiTagNames.length > 0 ? await upsertTags(aiTagNames, req.user._id) : [];
  
  const allTags = [...new Set([...(doc.tags.map(String)), ...aiTagIds.map(String)])];
  doc.tags = allTags;
  await doc.save();

  const populated = await doc.populate('tags', 'name color');
  res.status(200).json(new ApiResponse(200, populated.tags, 'Tags generated'));
});

module.exports = { getDocuments, getDocumentById, uploadDocument, deleteDocument, generateDocumentSummary, generateDocumentTags };
