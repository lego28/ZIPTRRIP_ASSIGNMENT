import React, { useState, useEffect } from 'react'
import { updateTodo } from '../api/todos.js'

export default function EditTodoModal({ todo, onUpdated, onClose }) {
  const [form, setForm] = useState({
    title: todo.title || '',
    description: todo.description || '',
    status: todo.status || 'pending',
    priority: todo.priority || 'medium',
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [apiError, setApiError] = useState('')

  // Close on Escape key
  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  function validate() {
    const errs = {}
    if (!form.title.trim()) {
      errs.title = 'Title is required.'
    } else if (form.title.trim().length > 200) {
      errs.title = 'Title must be 200 characters or fewer.'
    }
    if (form.description && form.description.length > 500) {
      errs.description = 'Description must be 500 characters or fewer.'
    }
    return errs
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setApiError('')
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setSubmitting(true)
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        status: form.status,
        priority: form.priority,
      }
      const updated = await updateTodo(todo.id, payload)
      onUpdated(updated)
    } catch (err) {
      setApiError(err.message || 'Failed to update todo.')
    } finally {
      setSubmitting(false)
    }
  }

  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick} role="dialog" aria-modal="true" aria-labelledby="edit-modal-title">
      <div className="modal">
        <div className="modal__header">
          <h2 className="modal__title" id="edit-modal-title">Edit Todo</h2>
          <button className="modal__close" onClick={onClose} aria-label="Close modal">×</button>
        </div>

        {apiError && <div className="alert alert--error">{apiError}</div>}

        <form className="modal__body" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="edit-title">
              Title <span className="required">*</span>
            </label>
            <input
              id="edit-title"
              className={`form-input${errors.title ? ' form-input--error' : ''}`}
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              maxLength={200}
              disabled={submitting}
            />
            {errors.title && <p className="form-error">{errors.title}</p>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="edit-description">
              Description
            </label>
            <textarea
              id="edit-description"
              className={`form-input form-textarea${errors.description ? ' form-input--error' : ''}`}
              name="description"
              value={form.description}
              onChange={handleChange}
              maxLength={500}
              rows={3}
              disabled={submitting}
            />
            {errors.description && <p className="form-error">{errors.description}</p>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="edit-status">
                Status
              </label>
              <select
                id="edit-status"
                className="form-input form-select"
                name="status"
                value={form.status}
                onChange={handleChange}
                disabled={submitting}
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="edit-priority">
                Priority
              </label>
              <select
                id="edit-priority"
                className="form-input form-select"
                name="priority"
                value={form.priority}
                onChange={handleChange}
                disabled={submitting}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="modal__footer">
            <button
              type="button"
              className="btn btn--secondary"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn--primary"
              disabled={submitting}
            >
              {submitting ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
