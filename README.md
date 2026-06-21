# Knowledge Vault AI

Knowledge Vault AI is a comprehensive personal knowledge operating system. It allows users to effortlessly capture, organize, and retrieve information from diverse sources—including articles, blogs, PDFs, YouTube videos, GitHub repositories, and personal notes. By organizing these sources into dedicated repositories and leveraging Gemini AI, users can perform semantic searches, explore content, and query their knowledge base in plain English.

---

## 1. Project Overview

The core problem Knowledge Vault AI solves is information fragmentation. People discover useful information everywhere, but struggle to find, organize, connect, or use that information effectively later. Knowledge Vault AI acts as a central hub where knowledge is captured with a single click, automatically embedded for semantic search, and made available for on-demand AI analysis. 

This is not a study or flashcard app; it is a productivity tool designed to minimize friction between discovering information and storing it securely.

## 2. Core Features

- **Universal Knowledge Capture:** Ingest URLs, text, and files.
- **On-Demand AI Analysis:** Generate summaries and tags explicitly to save tokens and costs.
- **Vector Search & Retrieval:** Find concepts by meaning, not just keywords.
- **Repository System:** Organize knowledge logically by domain, project, or context.
- **Chrome Extension Integration:** Seamlessly save content without leaving your current browser tab.

## 3. System Architecture

The application is built on a modern MERN stack augmented with AI capabilities:
- **Frontend:** React, Vite, Tailwind CSS, React Query, React Router.
- **Backend:** Node.js, Express.js.
- **Database:** MongoDB Atlas (with Vector Search capabilities).
- **AI Integration:** Google Gemini APIs for text generation, embeddings, and summarization.

## 4. Repository System

Repositories are the foundational organizational unit. A repository acts as an isolated context for a specific project or topic. When querying the AI or performing a search, users can scope their actions to a specific repository to ensure highly relevant, context-aware results.

## 5. Knowledge Sources

Knowledge Vault AI supports a wide array of sources:
- **Notes:** Markdown-supported personal notes.
- **PDFs & Documents:** File uploads with automatic text extraction.
- **Articles & Blogs:** Web scraping and text parsing from URLs.
- **YouTube:** Video metadata and transcript extraction.
- **GitHub:** Repository metadata parsing.

## 6. AI Capabilities

- **Semantic Search:** Uses vector embeddings to find relevant documents based on contextual meaning rather than exact string matching.
- **Repository Chat:** Have a conversational interface grounded strictly in the context of a specific repository.
- **Global Chat:** Ask questions across your entire vault.
- **On-demand Summaries:** Explicitly generate AI summaries for long notes or documents to save reading time.
- **Embedding-based Retrieval:** Automatic vectorization of all ingested text ensures instant search readiness.

## 7. Chrome Extension

The Knowledge Vault AI Chrome Extension is a crucial capture layer. Its purpose is to eliminate friction—optimizing for "Interesting information discovered → saved to repository in under 5 seconds." 

Features include:
- One-click saving of the current tab.
- Smart source detection (YouTube, GitHub, Article).
- On-the-fly repository creation directly from the extension popup.

## 8. Technology Stack

**Frontend:**
- React 18
- Vite
- Tailwind CSS
- React Query (@tanstack/react-query)
- React Router DOM
- Lucide React (Icons)

**Backend:**
- Node.js & Express
- MongoDB & Mongoose
- `@google/genai` (Gemini SDK)
- JWT (Authentication)
- Multer (File Uploads)

## 9. Project Structure

```text
KnowledgeVault/
├── backend/
│   ├── src/
│   │   ├── controllers/   # Route logic
│   │   ├── models/        # Mongoose schemas
│   │   ├── routes/        # API endpoints
│   │   ├── services/      # AI and business logic
│   │   └── utils/         # Helpers & constants
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── api/           # Axios API calls
│   │   ├── components/    # Reusable UI components
│   │   ├── context/       # React contexts (Auth)
│   │   ├── pages/         # Route pages (Dashboard, Landing, etc.)
│   │   └── App.jsx
│   └── index.css
└── extension/
    ├── manifest.json
    ├── popup.html
    ├── popup.js
    └── styles.css
```

## 10. Setup Instructions

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas cluster (with Vector Search index configured)
- Google Gemini API Key

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/knowledge-vault-ai.git
   cd knowledge-vault-ai
   ```

2. **Setup Backend:**
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file (see Environment Variables section) and start the server:
   ```bash
   npm run dev
   ```

3. **Setup Frontend:**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

4. **Setup Chrome Extension:**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `extension` folder.

## 11. Environment Variables

Create a `.env` file in the `backend/` directory with the following variables:

```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_secure_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
NODE_ENV=development
```

## 12. API Overview

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Authenticate and receive JWT
- `GET /api/repositories` - Fetch all user repositories
- `POST /api/knowledge/ingest` - Ingest a URL via the Chrome extension
- `POST /api/notes/:id/summary` - Generate an on-demand AI summary
- `POST /api/ai/chat` - Interact with the Vault Chat

## 13. Screenshots Section

*(Insert screenshots of Landing Page, Dashboard, Resource Details, and Chrome Extension here)*

## 14. Future Improvements

- Full offline support for the Chrome Extension.
- Integration with external knowledge bases (e.g., Notion, Obsidian).
- Advanced graph visualization of related notes.
- Support for audio transcription ingestion.

## 15. License

This project is licensed under the MIT License - see the LICENSE file for details.
