const fs = require('fs');
const path = require('path');

// Resolve to backend/data/todos.json regardless of cwd
const DATA_FILE = path.resolve(__dirname, '..', '..', 'data', 'todos.json');

/**
 * Read all todos from the JSON file.
 * Returns an empty array if the file is missing or contains invalid JSON.
 */
function readTodos() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.error(`[store] Data file not found at ${DATA_FILE}. Starting with empty list.`);
    } else {
      console.error(`[store] Failed to read/parse data file: ${err.message}. Starting with empty list.`);
    }
    return [];
  }
}

/**
 * Write the full todos array to the JSON file synchronously.
 * Throws on write failure so callers can handle it.
 */
function writeTodos(todos) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(todos, null, 2), 'utf8');
}

module.exports = { readTodos, writeTodos };
