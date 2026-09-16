import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

type ConfirmModalProps = {
  isOpen: boolean
  title: ReactNode
  children: ReactNode
  confirmLabel: ReactNode
  cancelLabel: ReactNode
  onConfirm: () => void
  onCancel: () => void
  secondaryConfirmLabel?: ReactNode
  onSecondaryConfirm?: () => void
  closeOnOverlayClick?: boolean
  labelledById?: string
}

const CONFIRM_MODAL_TITLE_ID = 'confirm-modal-title'

const ConfirmModal = ({
  isOpen,
  title,
  children,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  secondaryConfirmLabel,
  onSecondaryConfirm,
  closeOnOverlayClick = true,
  labelledById = CONFIRM_MODAL_TITLE_ID
}: ConfirmModalProps) => {
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCancel()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onCancel])

  const modalRoot =
    typeof document !== 'undefined'
      ? document.querySelector('.app') || document.body
      : null

  if (!isOpen || !modalRoot) {
    return null
  }

  return createPortal(
    <div
      className="confirm-modal-overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (closeOnOverlayClick && event.target === event.currentTarget) {
          onCancel()
        }
      }}
    >
      <div
        className="confirm-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledById}
      >
        <h2 id={labelledById}>{title}</h2>
        <div className="confirm-modal-content">{children}</div>
        <div className="confirm-modal-actions">
          <button type="button" className="confirm-modal-secondary" onClick={onCancel}>
            {cancelLabel}
          </button>
          {secondaryConfirmLabel && onSecondaryConfirm && (
            <button type="button" className="confirm-modal-secondary" onClick={onSecondaryConfirm}>
              {secondaryConfirmLabel}
            </button>
          )}
          <button type="button" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    modalRoot
  )
}

export default ConfirmModal
