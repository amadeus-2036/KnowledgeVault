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
  const { url, repository, clientContent, clientTitle } = req.body;

  if (!url) {
    return res.status(400).json({ success: false, message: 'URL is required' });
  }

  let title = clientTitle || 'Untitled Article';
  let content = clientContent || '';
  let type = 'article';
  let sourceUrl = url;

  // Use backend scraping only if it's youtube/github, or if the extension didn't send rendered text
  if (url.includes('youtube.com/') || url.includes('youtu.be/') || url.includes('github.com/') || !clientContent) {
    const extracted = await extractFromUrl(url);
    title = extracted.title;
    content = extracted.content;
    type = extracted.type;
    sourceUrl = extracted.sourceUrl;
  }

  // Initialize content with sourceUrl and extracted raw text
  const initialContent = `${sourceUrl}\n\n${content}`;

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
      const embedding = await generateEmbedding(`${note.title}\n\n${content}`);

      // Always add the type as a tag
      const typeTagId = await upsertTags([type], req.user._id);
      const allTags = [...new Set([...typeTagId.map(String)])];

      const updateData = {
        embedding,
        tags: allTags,
      };

      await Note.findByIdAndUpdate(note._id, updateData);
    } catch (err) {
      console.error('Background AI processing for ingested URL failed:', err.message);
    }
  });
});

module.exports = {
  ingestUrl
};
