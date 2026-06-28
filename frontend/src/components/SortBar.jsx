import React from 'react'

const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Date Created' },
  { value: 'priority', label: 'Priority' },
  { value: 'status', label: 'Status' },
]

export default function SortBar({ sortBy, sortDir, onSortChange }) {
  function handleSortByChange(e) {
    onSortChange({ sortBy: e.target.value, sortDir })
  }

  function handleSortDirChange(dir) {
    onSortChange({ sortBy, sortDir: dir })
  }

  // Status sort has no direction concept — always pending→in-progress→completed
  const showDirection = sortBy !== 'status'

  return (
    <div className="sort-bar">
      <span className="sort-bar__label">Sort by:</span>
      <div className="sort-bar__options">
        {SORT_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            className={`sort-btn${sortBy === opt.value ? ' sort-btn--active' : ''}`}
            onClick={() => onSortChange({ sortBy: opt.value, sortDir })}
            aria-pressed={sortBy === opt.value}
          >
            {opt.label}
            {sortBy === opt.value && showDirection && (
              <span className="sort-arrow">{sortDir === 'asc' ? ' ↑' : ' ↓'}</span>
            )}
          </button>
        ))}
      </div>

      {showDirection && (
        <div className="sort-bar__direction">
          <button
            className={`sort-dir-btn${sortDir === 'asc' ? ' sort-dir-btn--active' : ''}`}
            onClick={() => handleSortDirChange('asc')}
            aria-pressed={sortDir === 'asc'}
          >
            Asc
          </button>
          <button
            className={`sort-dir-btn${sortDir === 'desc' ? ' sort-dir-btn--active' : ''}`}
            onClick={() => handleSortDirChange('desc')}
            aria-pressed={sortDir === 'desc'}
          >
            Desc
          </button>
        </div>
      )}
    </div>
  )
}
