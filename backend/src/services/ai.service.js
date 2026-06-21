// src/services/ai.service.js
// Encapsulates all interactions with Google's Gemini API.
// Interview points:
// - Service layer separates AI logic from HTTP controllers
// - generateEmbedding returns a 768-dim vector used for semantic search
// - generateSummary and generateTags use the generative model (not embedding)
// - Context truncation (first 3000 chars) prevents hitting token limits for large docs

const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Embedding model: converts text → dense vector
// Used for semantic similarity search
const embeddingModel = genAI.getGenerativeModel({ model: 'gemini-embedding-2' });

// Generative model: used for summaries, tags, Q&A
const generativeModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

/**
 * Generate a 768-dimensional embedding vector for given text.
 * This vector captures the semantic meaning of the text.
 */
const generateEmbedding = async (text) => {
  try {
    // Truncate very long text to avoid token limits
    const truncated = text.slice(0, 8000);
    const request = {
      content: { parts: [{ text: truncated }] },
      outputDimensionality: 768
    };
    const result = await embeddingModel.embedContent(request);
    return result.embedding.values; // Array of 768 floats
  } catch (error) {
    console.error('Embedding generation failed:', error.message);
    return []; // Return empty array on failure — don't break the upload flow
  }
};

/**
 * Generate a concise summary of the provided text.
 */
const generateSummary = async (text) => {
  try {
    // Pass up to 400,000 chars to leverage gemini-1.5-flash large context window
    const truncated = text.slice(0, 400000);
    const prompt = `You are a concise note-taking assistant. 
Summarize the following text in 3-5 clear sentences. 
Focus on the key concepts and main ideas.

Text:
${truncated}

Summary:`;
    const result = await generativeModel.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error('Summary generation failed:', error.message);
    return 'Summary not available.';
  }
};

/**
 * Generate a detailed YouTube Video Overview (like Gemini's YouTube integration).
 */
const generateYouTubeOverview = async (transcript) => {
  try {
    const truncated = transcript.slice(0, 400000);
    const prompt = `You are an expert AI video analyst.
I am providing you with the raw auto-generated transcript of a YouTube video.
Please generate a comprehensive, highly readable Markdown overview of the video.

Format your response exactly like this:
## Video Overview
[A 1-2 paragraph executive summary of what the video is about and why it's valuable.]

## Key Takeaways
- [Bullet point 1]
- [Bullet point 2]
- [Bullet point 3...]

## Detailed Breakdown
[Break the video down into logical sections based on the flow of the transcript. Use markdown headers (###) for each section, and provide a paragraph explaining the content of that section.]

Raw Transcript:
${truncated}

Overview:`;
    const result = await generativeModel.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error('YouTube overview generation failed:', error.message);
    return 'Failed to generate video overview. Please try again.';
  }
};

/**
 * Generate relevant tags for content.
 * Returns an array of tag name strings.
 */
const generateTags = async (text, existingTags = []) => {
  try {
    const truncated = text.slice(0, 100000);
    const prompt = `You are a knowledge management system.
Generate 3-6 relevant, concise topic tags for the following content.
Return ONLY a JSON array of lowercase tag strings, nothing else.
Tags should be single words or short phrases (e.g. ["javascript", "algorithms", "dynamic programming"]).

Content:
${truncated}

Tags:`;
    const result = await generativeModel.generateContent(prompt);
    const responseText = result.response.text().trim();
    // Parse JSON array from response
    const jsonMatch = responseText.match(/\[.*\]/s);
    if (jsonMatch) {
      const tags = JSON.parse(jsonMatch[0]);
      return tags.filter((t) => typeof t === 'string').slice(0, 6);
    }
    return [];
  } catch (error) {
    console.error('Tag generation failed:', error.message);
    return [];
  }
};

/**
 * Answer a question using retrieved context (RAG pattern).
 * Interview point: RAG = Retrieval Augmented Generation
 *   1. Retrieve relevant documents via vector search
 *   2. Inject them as context into the LLM prompt
 *   3. LLM answers based on YOUR data, not just general knowledge
 */
const askWithContext = async (question, contextChunks) => {
  try {
    const contextText = contextChunks
      .map((chunk, i) => `[Source ${i + 1}: ${chunk.title}]\n${chunk.content}`)
      .join('\n\n---\n\n');

    const prompt = `You are a helpful AI assistant for a personal knowledge management system.
Answer the user's question based ONLY on the provided context from their personal notes and documents.
If the answer is not found in the context, say "I couldn't find relevant information in your vault for this question."
Be concise, accurate, and cite which source(s) you used.

CONTEXT FROM USER'S KNOWLEDGE VAULT:
${contextText}

USER'S QUESTION: ${question}

ANSWER:`;

    const result = await generativeModel.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error('AI Q&A failed:', error.message);
    throw new Error('Failed to generate answer');
  }
};

/**
 * Generate knowledge insights from user's recent content.
 */
const generateInsights = async (notesContent, documentsContent) => {
  try {
    const combined = [...notesContent, ...documentsContent]
      .slice(0, 10)
      .map((item) => `${item.title}: ${item.content?.slice(0, 300)}`)
      .join('\n');

    const prompt = `You are a learning analytics assistant.
Based on the following notes and documents from a student's knowledge vault, provide:
1. Top 5 frequently studied topics
2. Top 3 learning recommendations
Return as JSON with keys: "frequentTopics" (array of strings) and "recommendations" (array of strings).

Content:
${combined}

Response (JSON only):`;

    const result = await generativeModel.generateContent(prompt);
    const responseText = result.response.text().trim();
    const jsonMatch = responseText.match(/\{.*\}/s);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return { frequentTopics: [], recommendations: [] };
  } catch (error) {
    console.error('Insights generation failed:', error.message);
    return { frequentTopics: [], recommendations: [] };
  }
};

/**
 * Suggest a repository based on title, url, and user's repositories.
 */
const suggestRepository = async (title, url, repositories) => {
  if (!repositories || repositories.length === 0) return null;
  
  try {
    const repoList = repositories.map(r => `ID: ${r._id}, Name: ${r.name}, Desc: ${r.description || 'none'}`).join('\n');
    const prompt = `You are an intelligent knowledge routing assistant.
Given a web page title and URL, select the most appropriate repository from the user's list to save it to.
Respond ONLY with the exact ID of the best matching repository, or "none" if none are a good fit.

Page Title: ${title}
URL: ${url}

Available Repositories:
${repoList}

Best Match ID:`;

    const result = await generativeModel.generateContent(prompt);
    const answer = result.response.text().trim();
    if (answer && answer.toLowerCase() !== 'none' && repositories.find(r => String(r._id) === answer)) {
      return answer;
    }
    return null;
  } catch (error) {
    console.error('Suggest repository failed:', error.message);
    return null;
  }
};

module.exports = {
  generateEmbedding,
  generateSummary,
  generateYouTubeOverview,
  generateTags,
  askWithContext,
  generateInsights,
  suggestRepository,
};
