import { useEffect, useRef } from 'react'
import './DeleteConfirmModal.css'

export default function DeleteConfirmModal({
  open,
  title = 'Delete this item?',
  description = 'This can’t be undone. The item will be removed for good.',
  onCancel,
  onConfirm,
  busy = false,
}) {
  const cancelButton = useRef(null)

  useEffect(() => {
    if (!open) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    cancelButton.current?.focus()

    function handleKeyDown(event) {
      if (event.key === 'Escape' && !busy) onCancel()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, busy, onCancel])

  if (!open) return null

  function handleBackdropMouseDown(event) {
    if (event.target === event.currentTarget && !busy) onCancel()
  }

  return (
    <div
      className="delete-modal-scrim"
      onMouseDown={handleBackdropMouseDown}
    >
      <section
        className="delete-modal"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-modal-title"
        aria-describedby="delete-modal-description"
        aria-busy={busy}
      >
        <h2 id="delete-modal-title">{title}</h2>
        <p id="delete-modal-description">{description}</p>
        <div className="delete-modal-actions">
          <button
            ref={cancelButton}
            type="button"
            className="delete-modal-button delete-modal-cancel"
            onClick={onCancel}
            disabled={busy}
          >
            Cancel
          </button>
          <button
            type="button"
            className="delete-modal-button delete-modal-confirm"
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </section>
    </div>
  )
}
