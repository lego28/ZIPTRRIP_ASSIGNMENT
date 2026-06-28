import React from 'react'

export default function FilterBar({ filters, onChange, onClear }) {
  function handleChange(e) {
    const { name, value } = e.target
    onChange({ ...filters, [name]: value })
  }

  const hasActiveFilter =
    filters.status !== 'all' ||
    filters.priority !== 'all' ||
    filters.search.trim() !== ''

  return (
    <div className="filter-bar">
      <div className="filter-bar__controls">
        <div className="filter-group">
          <label className="filter-label" htmlFor="filter-status">
            Status
          </label>
          <select
            id="filter-status"
            className="form-input form-select filter-select"
            name="status"
            value={filters.status}
            onChange={handleChange}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label" htmlFor="filter-priority">
            Priority
          </label>
          <select
            id="filter-priority"
            className="form-input form-select filter-select"
            name="priority"
            value={filters.priority}
            onChange={handleChange}
          >
            <option value="all">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div className="filter-group filter-group--search">
          <label className="filter-label" htmlFor="filter-search">
            Search
          </label>
          <input
            id="filter-search"
            className="form-input filter-search"
            type="text"
            name="search"
            value={filters.search}
            onChange={handleChange}
            placeholder="Search title or description…"
          />
        </div>
      </div>

      {hasActiveFilter && (
        <button className="btn btn--ghost btn--sm filter-clear" onClick={onClear}>
          Clear Filters
        </button>
      )}
    </div>
  )
}
