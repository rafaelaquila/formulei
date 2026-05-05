/** Monitoramento de câmeras (Intelbras) — nome como aparece na lista de sistemas. */
export const MONITORAMENTO_CAMERA_SYSTEM = 'Monitoramento Intelbras' as const

export const PORTAL_BI_SYSTEM = 'Portal BI' as const

export function isMonitoramentoCameraSystem(sistema: string): boolean {
  return sistema === MONITORAMENTO_CAMERA_SYSTEM
}

export function isPortalBiSystem(sistema: string): boolean {
  return sistema === PORTAL_BI_SYSTEM
}
