const Document = require('../models/Document.model');
const Note = require('../models/Note.model'); // Depending on how we save URLs, we can save them as Documents or Notes. Let's save them as Documents with specific fileTypes since they have sourceUrl etc. Wait, Document doesn't have sourceUrl. I will save them as Notes or Documents. Since Document model doesn't have sourceUrl schema yet, wait I should update the models or use Note.
const { extractFromUrl } = require('../services/ingestion.service');
const { generateEmbedding, generateSummary, generateTags } = require('../services/ai.service');
const Tag = require('../models/Tag.model');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

// Helper: upsert tags
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

// POST /api/knowledge/ingest
const ingestUrl = asyncHandler(async (req, res) => {
  const { url, repository } = req.body;

  if (!url) {
    return res.status(400).json({ success: false, message: 'URL is required' });
  }

  // Use the new ingestion service
  const { title, content, type, sourceUrl } = await extractFromUrl(url);

  // Initialize content as loading if it's a youtube video
  const initialContent = type === 'youtube' 
    ? `${sourceUrl}\n\n*(Generating AI Video Overview...)*` 
    : `${sourceUrl}\n\n${content}`;

  const note = await Note.create({
    title: `[${type.toUpperCase()}] ${title}`,
    content: initialContent,
    user: req.user._id,
    repository: repository || null,
  });

  res.status(201).json(new ApiResponse(201, note, 'URL ingested successfully, AI processing started'));

  const { generateYouTubeOverview } = require('../services/ai.service');

  // Background AI processing
  setImmediate(async () => {
    try {
      let finalContent = content;
      if (type === 'youtube') {
        finalContent = await generateYouTubeOverview(content);
      }

      const [embedding, summary, aiTagNames] = await Promise.all([
        generateEmbedding(`${note.title}\n\n${finalContent}`),
        generateSummary(finalContent),
        generateTags(`${note.title}\n\n${finalContent}`),
      ]);

      const aiTagIds = aiTagNames.length > 0 ? await upsertTags(aiTagNames, req.user._id) : [];
      // Always add the type as a tag too
      const typeTagId = await upsertTags([type], req.user._id);

      const allTags = [...new Set([...aiTagIds.map(String), ...typeTagId.map(String)])];

      const updateData = {
        embedding,
        aiSummary: summary,
        tags: allTags,
      };
      if (type === 'youtube') {
        updateData.content = `${sourceUrl}\n\n${finalContent}`;
      }

      await Note.findByIdAndUpdate(note._id, updateData);
    } catch (err) {
      console.error('Background AI processing for ingested URL failed:', err.message);
    }
  });
});

module.exports = {
  ingestUrl
};
