import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { fetchTodoById, deleteTodo } from '../api/todos.js'
import EditTodoModal from '../components/EditTodoModal.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'
import '../styles/TodoDetailPage.css'

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
  if (!iso) return null
  const d = new Date(iso)
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function TodoDetailPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const todoId = searchParams.get('todoId')

  const [todo, setTodo] = useState(null)
  const [loading, setLoading] = useState(false)
  const [fetchError, setFetchError] = useState('')
  const [notFound, setNotFound] = useState(false)

  const [showEdit, setShowEdit] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => {
    if (!todoId) return // Missing ID — handled in render

    let cancelled = false
    setLoading(true)
    setFetchError('')
    setNotFound(false)
    setTodo(null)

    fetchTodoById(todoId)
      .then((data) => {
        if (!cancelled) setTodo(data)
      })
      .catch((err) => {
        if (cancelled) return
        if (err.status === 404) {
          setNotFound(true)
        } else {
          setFetchError(err.message || 'Failed to load todo.')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [todoId])

  function handleUpdated(updated) {
    setTodo(updated)
    setShowEdit(false)
  }

  async function handleDeleteConfirm() {
    try {
      await deleteTodo(todo.id)
      navigate('/')
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete todo.')
      setShowDeleteConfirm(false)
    }
  }

  // ── Render states ──────────────────────────────────────────────
  if (!todoId) {
    return (
      <div className="detail-page detail-page--error">
        <button className="btn btn--ghost back-btn" onClick={() => navigate('/')}>
          ← Back to Todos
        </button>
        <div className="alert alert--error" role="alert">
          Missing todo ID. Please navigate from the Todos list.
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="detail-page detail-page--loading">
        <button className="btn btn--ghost back-btn" onClick={() => navigate('/')}>
          ← Back to Todos
        </button>
        <div className="loading-wrapper" aria-label="Loading todo">
          <div className="spinner" />
          <p className="loading-text">Loading todo…</p>
        </div>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="detail-page detail-page--error">
        <button className="btn btn--ghost back-btn" onClick={() => navigate('/')}>
          ← Back to Todos
        </button>
        <div className="alert alert--error" role="alert">
          Todo not found. It may have been deleted.
        </div>
      </div>
    )
  }

  if (fetchError) {
    return (
      <div className="detail-page detail-page--error">
        <button className="btn btn--ghost back-btn" onClick={() => navigate('/')}>
          ← Back to Todos
        </button>
        <div className="alert alert--error" role="alert">
          {fetchError}
        </div>
      </div>
    )
  }

  if (!todo) return null

  const createdFormatted = formatDate(todo.createdAt)
  const updatedFormatted = todo.updatedAt ? formatDate(todo.updatedAt) : 'Not yet updated'

  return (
    <div className="detail-page">
      <div className="detail-page__nav">
        <button className="btn btn--ghost back-btn" onClick={() => navigate('/')}>
          ← Back to Todos
        </button>
      </div>

      <main className="detail-page__main">
        <div className="detail-card">
          <div className="detail-card__header">
            <h1 className="detail-card__title">{todo.title}</h1>
            <div className="detail-card__actions">
              <button className="btn btn--secondary" onClick={() => setShowEdit(true)}>
                Edit
              </button>
              <button
                className="btn btn--danger"
                onClick={() => { setDeleteError(''); setShowDeleteConfirm(true) }}
              >
                Delete
              </button>
            </div>
          </div>

          {deleteError && (
            <div className="alert alert--error" role="alert">{deleteError}</div>
          )}

          <div className="detail-card__badges">
            <span className={`badge badge--status badge--${todo.status}`}>
              {STATUS_LABELS[todo.status] || todo.status}
            </span>
            <span className={`badge badge--priority badge--priority-${todo.priority}`}>
              {PRIORITY_LABELS[todo.priority] || todo.priority}
            </span>
          </div>

          {todo.description ? (
            <p className="detail-card__description">{todo.description}</p>
          ) : (
            <p className="detail-card__description detail-card__description--empty">
              No description provided.
            </p>
          )}

          <dl className="detail-card__timestamps">
            <div className="detail-timestamp">
              <dt className="detail-timestamp__label">Created</dt>
              <dd className="detail-timestamp__value">{createdFormatted}</dd>
            </div>
            <div className="detail-timestamp">
              <dt className="detail-timestamp__label">Last Updated</dt>
              <dd className="detail-timestamp__value">{updatedFormatted}</dd>
            </div>
          </dl>
        </div>
      </main>

      {showEdit && (
        <EditTodoModal
          todo={todo}
          onUpdated={handleUpdated}
          onClose={() => setShowEdit(false)}
        />
      )}

      {showDeleteConfirm && (
        <ConfirmDialog
          title="Delete Todo"
          message={`Are you sure you want to delete "${todo.title}"? This action cannot be undone.`}
          confirmLabel="Delete"
          confirmClass="btn--danger"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </div>
  )
}
