// server.js — Application entry point
// Interview points:
// - dotenv loaded first so process.env is available everywhere
// - Helmet adds security headers (XSS, MIME sniffing protection, etc.)
// - CORS configured to only allow requests from the frontend origin
// - express.json() parses JSON body — required for POST/PUT routes
// - All routes mounted under /api prefix for clear namespacing
// - Error middleware registered LAST (Express requirement)

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');
const path = require('path');

const authRoutes = require('./src/routes/auth.routes');
const notesRoutes = require('./src/routes/notes.routes');
const documentsRoutes = require('./src/routes/documents.routes');
const tagsRoutes = require('./src/routes/tags.routes');
const aiRoutes = require('./src/routes/search.routes');
const repositoriesRoutes = require('./src/routes/repositories.routes');
const knowledgeRoutes = require('./src/routes/knowledge.routes');
const { errorHandler } = require('./src/middleware/error.middleware');

const app = express();

// ─── Security & Logging Middleware ──────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(morgan('dev'));

// ─── Body Parsers ────────────────────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Static file serving (uploaded files) ───────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── Health Check ────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ─── API Routes ──────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/documents', documentsRoutes);
app.use('/api/tags', tagsRoutes);
app.use('/api/repositories', repositoriesRoutes);
app.use('/api/knowledge', knowledgeRoutes);
app.use('/api/ai', aiRoutes);  // covers /api/ai/search, /api/ai/ask, /api/ai/insights, /api/ai/dashboard/stats

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ─── Centralized Error Handler (must be last) ────────────────────────────────
app.use(errorHandler);

// ─── Database Connection & Server Start ──────────────────────────────────────
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📚 Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error.message);
    process.exit(1);
  }
};

startServer();
