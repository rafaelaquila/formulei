export type EmploymentType = 'CLT' | 'PJ' | 'Estagiário' | 'Terceiro' | 'Outro'

export type AccessType =
  | 'Sem acesso'
  | 'Consulta'
  | 'Inclusão'
  | 'Alteração'
  | 'Exclusão'
  | 'Aprovação/autorização'
  | 'Administração'
  | 'Exportação de dados'

export type CameraMonitoringUnit = 'Matriz Brumado' | 'Matriz Vitória da Conquista'

export interface SystemAccess {
  id: string
  sistema: string
  utilizaSistema: 'Sim' | 'Não'
  tipoAcesso: AccessType[]
  observacoesPorTipoAcesso: Partial<Record<AccessType, string>>
  /** Monitoramento Intelbras: câmeras da Matriz Brumado (inventário completo). */
  cameraMonitoringUnit?: CameraMonitoringUnit
  camerasConsultaIds?: string[]
  /** Portal BI: relatórios com nível de dados autorizado. */
  portalBiReportIds?: string[]
  observacoesSistema: string
}

export interface CollaboratorAudit {
  id: string
  nome: string
  departamento: string
  sistemas: SystemAccess[]
}

export interface AuditFormData {
  setor: string
  gestorResponsavel: string
  dataPreenchimento: string
  colaboradores: CollaboratorAudit[]
  /** E-mail de quem preenche o formulário (contato / retorno). */
  emailRespondente: string
  tipoVinculo: EmploymentType
  declaracao: boolean
}

export interface DashboardInsight {
  totalFormularios: number
  sistemasMaisUtilizados: { sistema: string; total: number }[]
  acessosPorSetor: { setor: string; total: number }[]
  tiposAcessoComuns: { tipo: string; total: number }[]
  historico: DashboardHistoryRow[]
}

export interface DashboardHistoryRow {
  dataPreenchimento: string
  setor: string
  gestorResponsavel: string
  emailRespondente: string
  colaborador: string
  departamento: string
  tipoVinculo: string
  sistema: string
  unidadeMonitoramento: string
  tiposAcesso: string
  detalhamento: string
  observacoesSistema: string
}

export interface CollaboratorDirectoryEntry {
  id: string
  nome: string
  cpf: string | null
  setor: string | null
  createdAt: string
}

export interface PortalBiPermissionRow {
  id: string
  setor: string
  colaborador: string
  acessoBi: string
  parecerDiretoria: 'Pendente' | 'De acordo' | 'Não de acordo'
  observacaoDiretoria: string
}

export interface CameraMonitoringPermissionRow {
  id: string
  setor: string
  colaborador: string
  acessoCamera: string
  parecerDiretoria: 'Pendente' | 'De acordo' | 'Não de acordo'
  observacaoDiretoria: string
}
