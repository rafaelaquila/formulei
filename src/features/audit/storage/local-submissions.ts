import type { AuditFormData } from '@/shared/types/audit'

const LOCAL_STORAGE_KEY = 'formulei_submissions'

interface LocalSubmission {
  id: string
  payload: AuditFormData
  createdAt: string
}

export function readLocalSubmissions(): LocalSubmission[] {
  const raw = localStorage.getItem(LOCAL_STORAGE_KEY)
  if (!raw) return []

  try {
    return JSON.parse(raw) as LocalSubmission[]
  } catch {
    return []
  }
}

export function appendLocalSubmission(payload: AuditFormData) {
  const all = readLocalSubmissions()
  all.push({
    id: crypto.randomUUID(),
    payload,
    createdAt: new Date().toISOString(),
  })
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(all))
}
