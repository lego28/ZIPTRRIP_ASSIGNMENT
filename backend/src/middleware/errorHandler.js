/**
 * Global error-handling middleware.
 * Must be registered AFTER all routes with app.use(errorHandler).
 */
function errorHandler(err, req, res, next) {
  // Handle malformed JSON bodies (thrown by Express's built-in JSON parser)
  if (err.type === 'entity.parse.failed' || err.status === 400) {
    return res.status(400).json({ error: 'Invalid JSON in request body' });
  }

  // Log full error details server-side
  console.error('[errorHandler] Unhandled error:', err);

  return res.status(500).json({ error: 'Internal server error' });
}

module.exports = errorHandler;
