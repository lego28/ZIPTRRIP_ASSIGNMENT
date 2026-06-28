const express = require('express');
const router = express.Router();
const {
  getAllTodos,
  getTodoById,
  createTodo,
  updateTodo,
  deleteTodo,
} = require('../controllers/todoController');

// GET /api/todos       — list all todos
router.get('/', getAllTodos);

// GET /api/todos/:id   — get a single todo
router.get('/:id', getTodoById);

// POST /api/todos      — create a todo
router.post('/', createTodo);

// PUT /api/todos/:id   — update a todo (partial)
router.put('/:id', updateTodo);

// DELETE /api/todos/:id — delete a todo
router.delete('/:id', deleteTodo);

module.exports = router;
