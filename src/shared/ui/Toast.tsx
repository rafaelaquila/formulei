interface ToastProps {
  message: string
  type?: 'error' | 'success'
}

export function Toast({ message, type = 'error' }: ToastProps) {
  return (
    <div className={`toast toast-${type}`} role="status" aria-live="polite">
      <span className="toast-icon" aria-hidden="true">
        {type === 'success' ? '✓' : '!'}
      </span>
      <span>{message}</span>
    </div>
  )
}
