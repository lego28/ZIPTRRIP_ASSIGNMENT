const { v4: uuidv4 } = require('uuid');
const { readTodos, writeTodos } = require('../data/store');

// ─── Validation helpers ───────────────────────────────────────────────────────

const VALID_STATUSES = ['pending', 'in-progress', 'completed'];
const VALID_PRIORITIES = ['low', 'medium', 'high'];

function validateTitle(title) {
  if (title === undefined || title === null || String(title).trim() === '') {
    return 'Title is required and cannot be empty.';
  }
  if (String(title).length > 200) {
    return 'Title must not exceed 200 characters.';
  }
  return null;
}

function validateDescription(description) {
  if (description !== undefined && String(description).length > 500) {
    return 'Description must not exceed 500 characters.';
  }
  return null;
}

function validateStatus(status) {
  if (!VALID_STATUSES.includes(status)) {
    return `Status must be one of: ${VALID_STATUSES.join(', ')}.`;
  }
  return null;
}

function validatePriority(priority) {
  if (!VALID_PRIORITIES.includes(priority)) {
    return `Priority must be one of: ${VALID_PRIORITIES.join(', ')}.`;
  }
  return null;
}

// ─── Controllers ─────────────────────────────────────────────────────────────

/**
 * GET /api/todos
 * Returns all todos.
 */
function getAllTodos(req, res, next) {
  try {
    const todos = readTodos();
    return res.status(200).json(todos);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/todos/:id
 * Returns a single todo by ID.
 */
function getTodoById(req, res, next) {
  try {
    const todos = readTodos();
    const todo = todos.find((t) => t.id === req.params.id);
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    return res.status(200).json(todo);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/todos
 * Creates a new todo.
 */
function createTodo(req, res, next) {
  try {
    const { title, description, priority } = req.body || {};

    // Validate title
    const titleError = validateTitle(title);
    if (titleError) {
      return res.status(400).json({ error: titleError });
    }

    // Validate description
    const descriptionError = validateDescription(description);
    if (descriptionError) {
      return res.status(400).json({ error: descriptionError });
    }

    // Validate priority (only if provided)
    if (priority !== undefined) {
      const priorityError = validatePriority(priority);
      if (priorityError) {
        return res.status(400).json({ error: priorityError });
      }
    }

    const now = new Date().toISOString();
    const newTodo = {
      id: uuidv4(),
      title: String(title).trim(),
      description: description !== undefined ? String(description) : '',
      status: 'pending',
      priority: priority !== undefined ? priority : 'medium',
      createdAt: now,
      updatedAt: null,
    };

    const todos = readTodos();
    todos.push(newTodo);
    writeTodos(todos);

    return res.status(201).json(newTodo);
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/todos/:id
 * Partially updates an existing todo.
 */
function updateTodo(req, res, next) {
  try {
    const todos = readTodos();
    const index = todos.findIndex((t) => t.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    const { title, description, status, priority } = req.body || {};

    // Validate provided fields
    if (title !== undefined) {
      const titleError = validateTitle(title);
      if (titleError) {
        return res.status(400).json({ error: titleError });
      }
    }

    if (description !== undefined) {
      const descriptionError = validateDescription(description);
      if (descriptionError) {
        return res.status(400).json({ error: descriptionError });
      }
    }

    if (status !== undefined) {
      const statusError = validateStatus(status);
      if (statusError) {
        return res.status(400).json({ error: statusError });
      }
    }

    if (priority !== undefined) {
      const priorityError = validatePriority(priority);
      if (priorityError) {
        return res.status(400).json({ error: priorityError });
      }
    }

    // Apply partial update
    const existing = todos[index];
    const updatedTodo = {
      ...existing,
      ...(title !== undefined && { title: String(title).trim() }),
      ...(description !== undefined && { description: String(description) }),
      ...(status !== undefined && { status }),
      ...(priority !== undefined && { priority }),
      updatedAt: new Date().toISOString(),
    };

    todos[index] = updatedTodo;
    writeTodos(todos);

    return res.status(200).json(updatedTodo);
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/todos/:id
 * Deletes a todo by ID.
 */
function deleteTodo(req, res, next) {
  try {
    const todos = readTodos();
    const index = todos.findIndex((t) => t.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    todos.splice(index, 1);
    writeTodos(todos);

    return res.status(200).json({ message: 'Todo deleted successfully' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllTodos,
  getTodoById,
  createTodo,
  updateTodo,
  deleteTodo,
};
