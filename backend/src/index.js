const express = require('express');
const cors = require('cors');
const todoRoutes = require('./routes/todos');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ───────────────────────────────────────────────────────────────

// Enable CORS for all origins
app.use(cors());

// Parse JSON bodies; the built-in parser will throw on malformed JSON,
// which the errorHandler middleware will catch and return a 400 response.
app.use(express.json());

// ─── Routes ──────────────────────────────────────────────────────────────────

app.use('/api/todos', todoRoutes);

// 404 catch-all for unknown routes
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ─── Error handling ───────────────────────────────────────────────────────────

// Must be registered after all routes
app.use(errorHandler);

// ─── Start server ─────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`[server] Todo API running on http://localhost:${PORT}`);
});

module.exports = app;
