import React, { useEffect } from 'react'

export default function ConfirmDialog({ title, message, onConfirm, onCancel, confirmLabel = 'Delete', confirmClass = 'btn--danger' }) {
  // Close on Escape
  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onCancel])

  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) onCancel()
  }

  return (
    <div
      className="modal-backdrop"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <div className="modal modal--sm">
        <div className="modal__header">
          <h2 className="modal__title" id="confirm-dialog-title">
            {title || 'Confirm Action'}
          </h2>
          <button className="modal__close" onClick={onCancel} aria-label="Close dialog">×</button>
        </div>
        <div className="modal__body">
          <p className="confirm-dialog__message">{message || 'Are you sure?'}</p>
        </div>
        <div className="modal__footer">
          <button className="btn btn--secondary" onClick={onCancel}>
            Cancel
          </button>
          <button className={`btn ${confirmClass}`} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
