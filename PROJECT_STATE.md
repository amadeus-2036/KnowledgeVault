# Project Overview

* **Project name:** Knowledge Vault AI
* **Core purpose:** An AI-powered personal knowledge management platform. It allows users to store notes and documents, automatically generate summaries and tags, and perform semantic searches or RAG-based Q&A against their own vault.
* **Current status:** MVP / Phase 2 complete (Core MERN functionality + AI Features including embeddings, search, and RAG).

---

# Architecture

* **Frontend architecture:** React Single Page Application built with Vite. Uses React Router for navigation, React Query for data fetching and caching, and React Context for state management (Auth, Theme).
* **Backend architecture:** Node.js + Express RESTful API. Features a layered architecture with route handlers, controllers, and dedicated service layers (`ai.service.js`, `search.service.js`, `ingestion.service.js`).
* **Database architecture:** MongoDB Atlas. Utilizes standard collections for structured data and relationships, text indexes for full-text search, and Atlas Vector Search (`HNSW` indexes) for semantic search.
* **AI architecture:** Deep integration with Google Generative AI (Gemini). Uses `gemini-embedding-2` for generating 768-dimensional document vectors and `gemini-2.5-flash` for generative tasks (summarization, tagging, Q&A, insights).

---

# Database Models

### User
* **Purpose:** Represents an authenticated user in the system.
* **Fields:** `name`, `email`, `password` (bcrypt hashed), `avatar`, timestamps.
* **Relationships:** Referenced by Notes, Documents, Tags, and Repositories.

### Note
* **Purpose:** Stores user-created text notes.
* **Fields:** `title`, `content`, `aiSummary`, `embedding` (768-dim array), `isPinned`, timestamps.
* **Relationships:** Belongs to a `User`. References `Tag` (array of ObjectIds) and optionally a `Repository`.

### Document
* **Purpose:** Represents uploaded files (PDF/TXT).
* **Fields:** `name`, `originalName`, `fileType`, `fileSize`, `filePath` (local disk path), `extractedText` (raw parsed text), `aiSummary`, `embedding`, `processingStatus`, timestamps.
* **Relationships:** Belongs to a `User`. References `Tag` (array of ObjectIds) and optionally a `Repository`.

### Repository
* **Purpose:** Provides a way to logically group related notes and documents.
* **Fields:** `name`, `description`, `themeColor`, timestamps.
* **Relationships:** Belongs to a `User`. Notes and Documents reference this model.

### Tag
* **Purpose:** Represents a categorical tag that can be applied to notes and documents.
* **Fields:** `name`, `color`, timestamps.
* **Relationships:** Belongs to a `User`.

---

# API Inventory

### Auth Routes (`/api/auth`)
* `/register` (POST) - Register a new user.
* `/login` (POST) - Authenticate and return JWT.
* `/me` (GET) - Get current user profile.
* `/me` (PUT) - Update current user profile.

### Documents Routes (`/api/documents`)
* `/` (GET) - List user documents.
* `/` (POST) - Upload a new document (handles multipart/form-data via Multer).
* `/:id` (GET) - Get a specific document.
* `/:id` (DELETE) - Delete a document.

### Knowledge Routes (`/api/knowledge`)
* `/ingest` (POST) - Ingest content from a given URL (YouTube, GitHub, or Article).

### Notes Routes (`/api/notes`)
* `/` (GET) - List user notes.
* `/` (POST) - Create a new note.
* `/:id` (GET) - Get a specific note.
* `/:id` (PUT) - Update a note.
* `/:id` (DELETE) - Delete a note.
* `/:id/pin` (PATCH) - Toggle note pinned status.

### Repositories Routes (`/api/repositories`)
* `/` (GET) - List user repositories.
* `/` (POST) - Create a repository.
* `/:id` (GET) - Get a repository.
* `/:id` (PUT) - Update a repository.
* `/:id` (DELETE) - Delete a repository.

### Search Routes (`/api/search`)
* `/search` (GET) - Perform hybrid full-text and semantic search.
* `/ask` (POST) - Ask a question using RAG (Retrieval-Augmented Generation).
* `/insights` (GET) - Get AI-generated learning insights.
* `/dashboard/stats` (GET) - Get aggregate statistics for the dashboard.

### Tags Routes (`/api/tags`)
* `/` (GET) - List user tags.
* `/` (POST) - Create a new tag.
* `/:id` (DELETE) - Delete a tag.

---

# Frontend Inventory

### Pages
* **Landing (`/`):** Public landing page describing the product.
* **Login (`/login`):** User authentication.
* **Register (`/register`):** New account creation.
* **Dashboard (`/dashboard`):** Overview of user stats, recent activity, and AI insights.
* **Notes (`/notes`):** CRUD interface for text notes.
* **Documents (`/documents`):** Interface for uploading and managing files.
* **Search (`/search`):** Global search interface across the vault.
* **AskVault (`/ask`):** Chat interface for RAG-based Q&A.
* **Settings (`/settings`):** User profile and preferences configuration.
* **RepositoryDashboard (`/repo/:id`):** Scoped view of notes and documents within a specific repository.

### Major Components
* **AppLayout:** Main structural component (Sidebar + Main Content Area) that wraps protected routes.
* **ProtectedRoute:** Context-based authentication guard that redirects unauthenticated users to `/login`.

---

# AI Features

* **Summarization:** Uses `gemini-2.5-flash` to generate 3-5 sentence summaries of notes and documents, truncating extremely long texts up to 400k characters.
* **Embeddings:** Uses `gemini-embedding-2` to convert text (notes or extracted document text) into 768-dimensional dense vectors for similarity search.
* **Semantic Search:** Utilizes MongoDB Atlas `$vectorSearch` pipeline stage to find similar documents using the generated embeddings. It leverages an HNSW index.
* **RAG (Ask My Vault):** Uses vector search to retrieve relevant context chunks, injects them into a prompt template, and asks `gemini-2.5-flash` to generate a localized answer.
* **Chat:** Currently implemented as the AskVault RAG feature, allowing users to ask questions against their data.
* **Tagging:** Uses `gemini-2.5-flash` to automatically suggest 3-6 relevant topic tags based on the content of a note or document by requesting a JSON array response.
* **Insights:** Analyzes recent notes and documents to provide frequently studied topics and learning recommendations.
* **YouTube Overview:** Generates structured Markdown summaries with key takeaways and detailed breakdowns from raw YouTube transcripts.

---

# Repository Features

* **Grouping:** Users can create Repositories to logically group Notes and Documents.
* **Scoped Search:** Both full-text and semantic search can be optionally scoped to a specific repository ID.
* **Scoped Dashboard:** `RepositoryDashboard` page provides a filtered view of assets belonging only to that repository.

---

# Knowledge Ingestion Features

* **YouTube:** Uses `youtube-transcript` to extract captions and generates an AI overview.
* **GitHub:** Extracts the `README.md` content from public repositories using the GitHub API.
* **Articles (Web Pages):** Uses `axios` and `cheerio` to fetch and parse HTML, stripping out navigation/scripts to extract clean article text.

---

# Search System

* **Search architecture:** Hybrid search mechanism built in `search.service.js` combining full-text and semantic approaches. Results are executed concurrently and merged.
* **Vector search implementation:** Leverages MongoDB Atlas `$vectorSearch` with `notes_semantic_index` and `documents_semantic_index`. It maps the query to an embedding and finds nearest neighbors in the 768-dim space.
* **Repository-scoped search:** The search pipeline accepts an optional `repositoryId` to restrict `$match` or `$text` queries to a specific project.
* **Global search:** When no repository ID is provided, searches across the entire user's vault.

---

# Chat System

* **Global chat:** The `AskVault` page provides an interface to ask questions across all documents and notes in the user's vault.
* **Repository chat:** Currently, the API supports scoped searching, though RAG could inherently focus on repository-specific contexts if a filter is applied.
* **Retrieval pipeline:** `question -> generateEmbedding() -> vectorSearch -> extract context chunks -> build prompt -> generateContent()`.

---

# User Workflows

* **Document Ingestion Workflow:** User uploads a PDF/TXT -> File is saved to local disk -> Text is extracted -> AI generates summary and tags -> AI generates embedding vector -> Saved to database.
* **Web Ingestion Workflow:** User provides a URL -> Server detects source (YouTube/GitHub/Article) -> Extracts raw text -> Generates summary, tags, and embeddings -> Saves as a new Knowledge asset.
* **Search Workflow:** User enters query -> System runs `$text` search (keyword) and `$vectorSearch` (semantic) concurrently -> Returns unified results categorized by type.
* **Q&A Workflow:** User asks a question -> System retrieves relevant chunks via vector search -> Injects into LLM prompt -> Streams/returns generated answer with sources.

---

# Missing Features

*(Features that appear planned or are standard extensions but not fully implemented in code)*
* **Cloud Storage for Uploads:** Files are currently saved to the local `./uploads` directory. S3 or equivalent cloud storage is not implemented.
* **Asynchronous Job Queues:** AI processing happens synchronously or via unmanaged promises, risking timeouts for large documents. (BullMQ is mentioned as a scalability note but not implemented).
* **Refresh Tokens:** Auth relies purely on short-lived JWTs without a refresh token rotation mechanism.
* **Redis Caching:** Tag and profile caching is mentioned in scalability notes but not implemented.
* **Advanced Chat Memory:** The RAG system handles single questions well but does not appear to maintain complex multi-turn conversation history in the database.

---

# Technical Debt

* **Local File Storage:** Using `multer` to store files on local disk (`./uploads`) prevents the backend from scaling horizontally (statelessness violation).
* **Fat Payloads:** `extractedText` and `embedding` fields are large. Although `select: false` is used to omit them from standard queries, managing 400k characters in a single MongoDB document can impact performance and memory.
* **Synchronous AI Calls on Upload:** Generative AI calls during file upload might cause HTTP timeouts if the Gemini API is slow or rate-limited. This should be decoupled using a background worker.
* **Error Handling on AI Failures:** `generateEmbedding` fails silently (returns empty array), which breaks semantic search for that document without notifying the user.
* **Lack of E2E/Unit Tests:** No dedicated test suites are visible in the repository structure.

---

# Future Roadmap

### High Priority
* **Cloud File Storage:** Migrate Multer uploads to AWS S3 or Google Cloud Storage to enable horizontal scaling.
* **Background Processing Worker:** Implement BullMQ (or similar) to handle embedding generation and text extraction asynchronously, improving upload reliability and API response times.
* **Robust Error Handling:** Improve retry logic for Gemini API rate limits and properly flag documents with failed embeddings so they can be re-processed.

### Medium Priority
* **Refresh Token Architecture:** Improve session security and user experience by implementing refresh tokens.
* **Conversation Memory:** Extend the `askWithContext` service to accept and manage chat history for multi-turn conversations.
* **Redis Caching:** Cache frequently accessed data like user tags and global statistics.

### Nice To Have
* **Expanded Ingestion Sources:** Add support for Notion, Google Drive, or Slack integrations.
* **Advanced RAG Capabilities:** Implement chunking strategies (e.g., recursive character splitting) for massive documents instead of relying entirely on Gemini's large context window.
* **User Sharing/Collaboration:** Allow users to share specific notes, documents, or entire repositories with other users.
