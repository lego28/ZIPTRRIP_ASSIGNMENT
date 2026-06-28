import React, { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchTodos, deleteTodo } from '../api/todos.js'
import TodoCard from '../components/TodoCard.jsx'
import TodoForm from '../components/TodoForm.jsx'
import EditTodoModal from '../components/EditTodoModal.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'
import FilterBar from '../components/FilterBar.jsx'
import SortBar from '../components/SortBar.jsx'
import '../styles/TodosListPage.css'

const DEFAULT_FILTERS = { status: 'all', priority: 'all', search: '' }
const DEFAULT_SORT = { sortBy: 'createdAt', sortDir: 'desc' }

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 }
const STATUS_ORDER = { pending: 0, 'in-progress': 1, completed: 2 }

function applyFilters(todos, filters) {
  return todos.filter((todo) => {
    if (filters.status !== 'all' && todo.status !== filters.status) return false
    if (filters.priority !== 'all' && todo.priority !== filters.priority) return false
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase()
      const inTitle = (todo.title || '').toLowerCase().includes(q)
      const inDesc = (todo.description || '').toLowerCase().includes(q)
      if (!inTitle && !inDesc) return false
    }
    return true
  })
}

function applySort(todos, sortBy, sortDir) {
  const sorted = [...todos]
  sorted.sort((a, b) => {
    if (sortBy === 'createdAt') {
      const diff = new Date(a.createdAt) - new Date(b.createdAt)
      return sortDir === 'asc' ? diff : -diff
    }
    if (sortBy === 'priority') {
      const diff = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
      // asc = low→high (reversed order map), desc = high→low
      return sortDir === 'asc' ? -diff : diff
    }
    if (sortBy === 'status') {
      return STATUS_ORDER[a.status] - STATUS_ORDER[b.status]
    }
    return 0
  })
  return sorted
}

export default function TodosListPage() {
  const navigate = useNavigate()
  const [todos, setTodos] = useState([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState('')

  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [sort, setSort] = useState(DEFAULT_SORT)

  const [editingTodo, setEditingTodo] = useState(null)
  const [deletingTodo, setDeletingTodo] = useState(null)
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setFetchError('')
    fetchTodos()
      .then((data) => {
        if (!cancelled) setTodos(data)
      })
      .catch((err) => {
        if (!cancelled) setFetchError(err.message || 'Failed to load todos.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  const displayedTodos = useMemo(() => {
    const filtered = applyFilters(todos, filters)
    return applySort(filtered, sort.sortBy, sort.sortDir)
  }, [todos, filters, sort])

  function handleCreated(newTodo) {
    setTodos((prev) => [newTodo, ...prev])
  }

  function handleCardClick(todo) {
    navigate(`/todo?todoId=${todo.id}`)
  }

  function handleEditOpen(todo) {
    setEditingTodo(todo)
  }

  function handleEditClose() {
    setEditingTodo(null)
  }

  function handleUpdated(updatedTodo) {
    setTodos((prev) => prev.map((t) => (t.id === updatedTodo.id ? updatedTodo : t)))
    setEditingTodo(null)
  }

  function handleDeleteOpen(todo) {
    setDeletingTodo(todo)
    setDeleteError('')
  }

  function handleDeleteCancel() {
    setDeletingTodo(null)
    setDeleteError('')
  }

  async function handleDeleteConfirm() {
    if (!deletingTodo) return
    try {
      await deleteTodo(deletingTodo.id)
      setTodos((prev) => prev.filter((t) => t.id !== deletingTodo.id))
      setDeletingTodo(null)
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete todo.')
    }
  }

  function handleClearFilters() {
    setFilters(DEFAULT_FILTERS)
  }

  return (
    <div className="list-page">
      <header className="list-page__header">
        <h1 className="list-page__title">📝 My Todos</h1>
        <p className="list-page__subtitle">Manage your tasks</p>
      </header>

      <main className="list-page__main">
        <section className="list-page__form-section" aria-label="Create todo">
          <TodoForm onCreated={handleCreated} />
        </section>

        <section className="list-page__list-section" aria-label="Todo list">
          <div className="list-page__controls">
            <FilterBar
              filters={filters}
              onChange={setFilters}
              onClear={handleClearFilters}
            />
            <SortBar
              sortBy={sort.sortBy}
              sortDir={sort.sortDir}
              onSortChange={(s) => setSort(s)}
            />
          </div>

          {deleteError && (
            <div className="alert alert--error">{deleteError}</div>
          )}

          {loading && (
            <div className="loading-wrapper" aria-label="Loading todos">
              <div className="spinner" />
              <p className="loading-text">Loading todos…</p>
            </div>
          )}

          {!loading && fetchError && (
            <div className="alert alert--error" role="alert">
              {fetchError}
            </div>
          )}

          {!loading && !fetchError && (
            <>
              <p className="list-page__count">
                {displayedTodos.length === 0
                  ? 'No todos found.'
                  : `${displayedTodos.length} todo${displayedTodos.length !== 1 ? 's' : ''}`}
              </p>
              {displayedTodos.length === 0 ? (
                <div className="empty-state">
                  <p className="empty-state__message">
                    {todos.length === 0
                      ? 'No todos yet. Create one above!'
                      : 'No todos match your current filters.'}
                  </p>
                </div>
              ) : (
                <div className="todo-list" role="list">
                  {displayedTodos.map((todo) => (
                    <div key={todo.id} role="listitem">
                      <TodoCard
                        todo={todo}
                        onClick={handleCardClick}
                        onEdit={handleEditOpen}
                        onDelete={handleDeleteOpen}
                      />
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </section>
      </main>

      {editingTodo && (
        <EditTodoModal
          todo={editingTodo}
          onUpdated={handleUpdated}
          onClose={handleEditClose}
        />
      )}

      {deletingTodo && (
        <ConfirmDialog
          title="Delete Todo"
          message={`Are you sure you want to delete "${deletingTodo.title}"? This action cannot be undone.`}
          confirmLabel="Delete"
          confirmClass="btn--danger"
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
        />
      )}
    </div>
  )
}
