import type { CameraMonitoringUnit } from '@/shared/types/audit'

export const UNIT_OPTIONS: CameraMonitoringUnit[] = [
  'Matriz Brumado',
  'Filial Vitória da Conquista',
  'Filial Timóteo',
  'Filial Ouro Branco',
  'Filial Juiz de Fora',
  'Filial Piracicaba',
  'Filial Candeias',
  'Filial Camaçari',
  'Filial Resende',
]

const UNIT_ORDER = new Map(UNIT_OPTIONS.map((u, i) => [u, i]))

export function normalizeLegacyUnitLabel(value: string): CameraMonitoringUnit {
  const trimmed = value.trim()
  if (trimmed === 'Matriz Brumado') return 'Matriz Brumado'
  if (trimmed.startsWith('Matriz ')) {
    const rest = trimmed.slice('Matriz '.length)
    return (`Filial ${rest}`) as CameraMonitoringUnit
  }
  return trimmed as CameraMonitoringUnit
}

export function sortUnitsByCatalogOrder(
  units: CameraMonitoringUnit[],
): CameraMonitoringUnit[] {
  return [...units].sort((a, b) => (UNIT_ORDER.get(a) ?? 999) - (UNIT_ORDER.get(b) ?? 999))
}
