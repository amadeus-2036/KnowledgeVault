# Knowledge Vault AI

An AI-powered personal knowledge management platform built with the MERN stack + Gemini AI.

## Quick Start

### 1. Clone & Setup

```bash
# Navigate to project
cd knowledge-vault-ai
```

### 2. Backend Setup

```bash
cd backend

# Copy env file and fill in your values
cp .env.example .env

# Install dependencies (already done if scaffolded)
npm install

# Start development server
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies (already done if scaffolded)
npm install

# Start Vite dev server
npm run dev
```

App runs at: http://localhost:5173  
API runs at: http://localhost:5000

---

## Environment Variables (backend/.env)

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/knowledge-vault
JWT_SECRET=your_long_random_secret_here
JWT_EXPIRES_IN=7d
GEMINI_API_KEY=your_gemini_api_key
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
CLIENT_URL=http://localhost:5173
```

### Getting API Keys

1. **MongoDB Atlas** — https://cloud.mongodb.com  
   - Create a free M0 cluster  
   - Create a database user  
   - Copy the connection string  
   - Whitelist your IP (or use 0.0.0.0/0 for development)

2. **Gemini API** — https://aistudio.google.com  
   - Create a new project  
   - Enable the Generative Language API  
   - Create an API key

---

## MongoDB Atlas Vector Search Setup

After deploying, create vector search indexes in the Atlas UI:

**For the `notes` collection:**
```json
{
  "fields": [
    {
      "type": "vector",
      "path": "embedding",
      "numDimensions": 768,
      "similarity": "cosine"
    },
    {
      "type": "filter",
      "path": "user"
    }
  ]
}
```
Name this index: `notes_semantic_index`

**For the `documents` collection:**  
Same structure, name it: `documents_semantic_index`

> Without vector indexes, semantic search will fail gracefully (returns empty results).  
> Full-text search and all other features still work without them.

---

## Project Structure

```
knowledge-vault-ai/
├── backend/
│   ├── src/
│   │   ├── controllers/    # Route handlers
│   │   ├── routes/         # Express routers
│   │   ├── middleware/      # Auth, error, upload
│   │   ├── models/          # Mongoose schemas
│   │   ├── services/        # AI & search business logic
│   │   └── utils/           # ApiError, ApiResponse, asyncHandler
│   ├── uploads/             # Multer file storage
│   └── server.js
└── frontend/
    └── src/
        ├── api/             # Axios API functions
        ├── components/      # Reusable UI components
        ├── context/         # Auth context
        ├── hooks/           # Custom hooks
        ├── pages/           # One file per page
        └── router/          # ProtectedRoute
```

---

## Features

### Phase 1 — Core MERN
- ✅ JWT Authentication (register, login, logout)
- ✅ Protected routes (frontend + backend)
- ✅ Notes CRUD with pagination
- ✅ Document upload (PDF + TXT) with Multer
- ✅ Tags (create, filter, per-user)
- ✅ Dashboard with stats and activity

### Phase 2 — AI Features
- ✅ AI summary generation (Gemini)
- ✅ Auto tag generation (Gemini)
- ✅ Embeddings for all notes/documents (Gemini text-embedding-004)
- ✅ Semantic vector search (MongoDB Atlas Vector Search)
- ✅ Full-text search ($text index)
- ✅ Ask My Vault — RAG Q&A (retrieve → augment → generate)
- ✅ Knowledge insights

---

## Interview Talking Points

| Topic | What to say |
|-------|-------------|
| JWT Auth | Stateless, signed token. No session store needed. Interceptor auto-attaches it. |
| Mongoose schemas | User → Note/Document → Tag using ObjectId references |
| Service layer | AI logic in `services/` not in controllers — separation of concerns |
| Vector search | Gemini generates 768-dim embeddings; Atlas HNSW index finds similar vectors |
| RAG pattern | Retrieve → Augment context → Generate with Gemini |
| asyncHandler | HOF that catches async errors and forwards to error middleware |
| React Query | Caching, stale-while-revalidate, mutation invalidation |
| ProtectedRoute | Context-based auth guard, redirects to /login |

---

## Scalability Notes (for interviews)

> "This is production-inspired. For actual production scale I would add:"

- **Redis** — Cache frequently read data (tags, user profiles)
- **BullMQ** — Job queue for async AI processing (not `setImmediate`)
- **AWS S3** — Move file storage from disk to cloud
- **Refresh tokens** — Rotate short-lived access tokens
- **Rate limiting** — Per-user API rate limits with Redis
- **Monitoring** — Sentry for errors, Prometheus for metrics
