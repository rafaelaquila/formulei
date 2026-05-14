import type { AccessType, EmploymentType } from '@/shared/types/audit'

export const SYSTEM_SUGGESTIONS = [
  'ATS',
  'Softran',
  'HCM',
  'Trafegus',
  'Sascar',
  'eDocs',
  'Monitoramento Intelbras',
  'MatrixGo',
  'MaaS360',
  'Navita MDM',
  'Abasteceu',
  'Jorney',
  'KMM',
  'Senior X',
  'Synctruck',
  'Portal Faturei',
  'Portal BI',
] as const

export const EMPLOYMENT_TYPES: EmploymentType[] = [
  'CLT',
  'PJ',
  'Estagiário',
  'Terceiro',
  'Outro',
]

export const ACCESS_TYPES: AccessType[] = [
  'Sem acesso',
  'Consulta',
  'Inclusão',
  'Alteração',
  'Exclusão',
  'Aprovação/autorização',
  'Administração',
  'Exportação de dados',
]

