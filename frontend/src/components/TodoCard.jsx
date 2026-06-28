import React from 'react'

const STATUS_LABELS = {
  pending: 'Pending',
  'in-progress': 'In Progress',
  completed: 'Completed',
}

const PRIORITY_LABELS = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
}

function formatDate(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default function TodoCard({ todo, onEdit, onDelete, onClick }) {
  function handleEdit(e) {
    e.stopPropagation()
    onEdit(todo)
  }

  function handleDelete(e) {
    e.stopPropagation()
    onDelete(todo)
  }

  return (
    <div
      className="todo-card"
      onClick={() => onClick(todo)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick(todo)}
      aria-label={`View details for ${todo.title}`}
    >
      <div className="todo-card__content">
        <h3 className="todo-card__title">{todo.title}</h3>
        {todo.description && (
          <p className="todo-card__description">{todo.description}</p>
        )}
        <div className="todo-card__meta">
          <span className={`badge badge--status badge--${todo.status}`}>
            {STATUS_LABELS[todo.status] || todo.status}
          </span>
          <span className={`badge badge--priority badge--priority-${todo.priority}`}>
            {PRIORITY_LABELS[todo.priority] || todo.priority}
          </span>
          <span className="todo-card__date">Created {formatDate(todo.createdAt)}</span>
        </div>
      </div>
      <div className="todo-card__actions" onClick={(e) => e.stopPropagation()}>
        <button
          className="btn btn--secondary btn--sm"
          onClick={handleEdit}
          aria-label={`Edit ${todo.title}`}
        >
          Edit
        </button>
        <button
          className="btn btn--danger btn--sm"
          onClick={handleDelete}
          aria-label={`Delete ${todo.title}`}
        >
          Delete
        </button>
      </div>
    </div>
  )
}
