import { SYSTEM_SUGGESTIONS } from '@/shared/constants/audit'
import type { SystemAccess } from '@/shared/types/audit'

function catalogOrderIndex(name: string): number {
  const idx = (SYSTEM_SUGGESTIONS as readonly string[]).indexOf(name)
  return idx === -1 ? 9999 : idx
}

/** Mesma ordem fixa da lista de checkboxes (catálogo), não a ordem em que o usuário marcou. */
export function sortSystemAccessesByCatalog(sistemas: SystemAccess[]): SystemAccess[] {
  return [...sistemas].sort((a, b) => {
    const da = catalogOrderIndex(a.sistema)
    const db = catalogOrderIndex(b.sistema)
    if (da !== db) return da - db
    return a.sistema.localeCompare(b.sistema)
  })
}
