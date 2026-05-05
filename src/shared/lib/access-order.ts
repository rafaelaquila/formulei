import { ACCESS_TYPES } from '@/shared/constants/audit'
import type { AccessType } from '@/shared/types/audit'

/** Mantém a ordem visual dos tipos de acesso (mesma ordem dos checkboxes na tela). */
export function orderedSelectedAccessTypes(selected: AccessType[]): AccessType[] {
  return ACCESS_TYPES.filter((type) => selected.includes(type))
}
