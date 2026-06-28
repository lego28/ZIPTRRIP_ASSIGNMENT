import React, { useState } from 'react'
import { createTodo } from '../api/todos.js'

const DEFAULT_FORM = { title: '', description: '', priority: 'medium' }

export default function TodoForm({ onCreated }) {
  const [form, setForm] = useState(DEFAULT_FORM)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [apiError, setApiError] = useState('')

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    // Clear field-level error on change
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
      const payload = { title: form.title.trim(), priority: form.priority }
      if (form.description.trim()) payload.description = form.description.trim()
      const created = await createTodo(payload)
      setForm(DEFAULT_FORM)
      setErrors({})
      onCreated(created)
    } catch (err) {
      setApiError(err.message || 'Failed to create todo.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="todo-form" onSubmit={handleSubmit} noValidate>
      <h2 className="todo-form__heading">Add New Todo</h2>

      {apiError && <div className="alert alert--error">{apiError}</div>}

      <div className="form-group">
        <label className="form-label" htmlFor="create-title">
          Title <span className="required">*</span>
        </label>
        <input
          id="create-title"
          className={`form-input${errors.title ? ' form-input--error' : ''}`}
          type="text"
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Enter todo title…"
          maxLength={200}
          disabled={submitting}
        />
        {errors.title && <p className="form-error">{errors.title}</p>}
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="create-description">
          Description
        </label>
        <textarea
          id="create-description"
          className={`form-input form-textarea${errors.description ? ' form-input--error' : ''}`}
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Optional description…"
          maxLength={500}
          rows={3}
          disabled={submitting}
        />
        {errors.description && <p className="form-error">{errors.description}</p>}
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="create-priority">
          Priority
        </label>
        <select
          id="create-priority"
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

      <button
        type="submit"
        className="btn btn--primary"
        disabled={submitting}
      >
        {submitting ? 'Creating…' : 'Create Todo'}
      </button>
    </form>
  )
}
