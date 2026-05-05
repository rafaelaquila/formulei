import { useCallback, useEffect, useRef, useState } from 'react'

export type ToastVariant = 'error' | 'success'

/** Toast com auto-dismiss e limpeza de timeout ao desmontar. */
export function useToast(autoHideMs = 5000) {
  const [toast, setToast] = useState<{ message: string; type: ToastVariant } | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const showToast = useCallback(
    (message: string, type: ToastVariant) => {
      if (timeoutRef.current !== undefined) {
        clearTimeout(timeoutRef.current)
      }
      setToast({ message, type })
      timeoutRef.current = setTimeout(() => {
        setToast(null)
        timeoutRef.current = undefined
      }, autoHideMs)
    },
    [autoHideMs],
  )

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== undefined) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return { toast, showToast }
}
