import { useEffect, useState } from 'react'

/** Persistência simples de rascunho em localStorage (MVP). */
export function useDraft<T>(storageKey: string, initialState: T) {
  const [state, setState] = useState<T>(() => {
    const raw = localStorage.getItem(storageKey)
    if (!raw) return initialState

    try {
      const parsed = JSON.parse(raw) as Partial<T>
      return { ...initialState, ...parsed } as T
    } catch {
      return initialState
    }
  })

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(state))
  }, [state, storageKey])

  const clearDraft = () => {
    localStorage.removeItem(storageKey)
    setState(initialState)
  }

  return { state, setState, clearDraft }
}
