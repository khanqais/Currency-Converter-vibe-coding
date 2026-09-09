const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Initialize SQLite DB and create tables on startup
const { db } = require('./db/database');

const convertRoutes     = require('./routes/convert');
const historyRoutes     = require('./routes/history');
const favoritesRoutes   = require('./routes/favorites');
const travelBudgetRoutes = require('./routes/travelBudget');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'DELETE'],
  credentials: true,
}));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api', limiter);

// Routes
app.use('/api', convertRoutes);
app.use('/api', historyRoutes);
app.use('/api', favoritesRoutes);
app.use('/api', travelBudgetRoutes);

// Health check
app.get('/health', (req, res) => {
  // Verify DB is accessible
  const row = db.prepare('SELECT 1 AS ok').get();
  res.json({ status: 'ok', db: row ? 'sqlite' : 'error', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`✅ SQLite DB ready — currency_converter.db`);
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
