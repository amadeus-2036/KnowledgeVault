const axios = require('axios');
const cheerio = require('cheerio');
const { YoutubeTranscript } = require('youtube-transcript');

/**
 * Extract content from a YouTube URL
 */
const extractYouTube = async (url) => {
  try {
    // Try to get title from page
    let title = 'YouTube Video';
    try {
      const { data } = await axios.get(url);
      const $ = cheerio.load(data);
      title = $('title').text().replace(' - YouTube', '') || title;
    } catch (e) {
      console.warn('Could not fetch YouTube title', e.message);
    }

    let transcriptData = '';
    try {
      const transcript = await YoutubeTranscript.fetchTranscript(url);
      transcriptData = transcript.map(t => t.text).join(' ');
    } catch (e) {
      console.warn('Could not fetch YouTube transcript', e.message);
      transcriptData = 'No transcript available for this video.';
    }

    return {
      title,
      content: transcriptData,
      type: 'youtube',
      sourceUrl: url
    };
  } catch (error) {
    throw new Error('Failed to process YouTube URL.');
  }
};

/**
 * Extract content from a GitHub Repository (specifically the README)
 */
const extractGitHub = async (url) => {
  try {
    // url format: https://github.com/owner/repo
    const parts = url.replace(/\/$/, '').split('/');
    const repo = parts.pop();
    const owner = parts.pop();

    if (!owner || !repo) throw new Error('Invalid GitHub URL');

    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/readme`;
    const { data } = await axios.get(apiUrl, {
      headers: { 'Accept': 'application/vnd.github.v3+json' }
    });

    const content = Buffer.from(data.content, 'base64').toString('utf-8');

    return {
      title: `${owner}/${repo} README`,
      content,
      type: 'github',
      sourceUrl: url
    };
  } catch (error) {
    throw new Error('Failed to extract GitHub repository README.');
  }
};

/**
 * Extract content from a generic article/blog URL
 */
const extractArticle = async (url) => {
  try {
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    const $ = cheerio.load(data);
    
    // Remove scripts, styles, nav, footer to get clean text
    $('script, style, nav, footer, header, aside, noscript, iframe').remove();

    const title = $('title').text().trim() || 'Untitled Article';
    
    // Try to find the main article content, fallback to body
    let content = '';
    if ($('article').length > 0) {
      content = $('article').text().trim();
    } else if ($('main').length > 0) {
      content = $('main').text().trim();
    } else {
      content = $('body').text().trim();
    }

    // Clean up excessive whitespace
    content = content.replace(/\s+/g, ' ').trim();

    return {
      title,
      content,
      type: 'article',
      sourceUrl: url
    };
  } catch (error) {
    throw new Error('Failed to extract article content.');
  }
};

/**
 * Main ingestion router based on URL
 */
const extractFromUrl = async (url) => {
  if (url.includes('youtube.com/') || url.includes('youtu.be/')) {
    return extractYouTube(url);
  }
  if (url.includes('github.com/')) {
    return extractGitHub(url);
  }
  return extractArticle(url);
};

module.exports = {
  extractFromUrl
};
