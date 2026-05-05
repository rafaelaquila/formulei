import type { AuditFormData, CollaboratorAudit, SystemAccess } from '@/shared/types/audit'
import {
  isMonitoramentoCameraSystem,
  isPortalBiSystem,
} from '@/shared/constants/system-ids'

export const AUDIT_DRAFT_STORAGE_KEY = 'formulei_audit_draft_v6'

export function createSystemAccess(systemName: string): SystemAccess {
  const base: SystemAccess = {
    id: crypto.randomUUID(),
    sistema: systemName,
    utilizaSistema: 'Sim',
    tipoAcesso: [],
    observacoesPorTipoAcesso: {},
    observacoesSistema: '',
  }

  if (isMonitoramentoCameraSystem(systemName)) {
    return {
      ...base,
      tipoAcesso: ['Consulta'],
      cameraMonitoringUnit: 'Matriz Brumado',
      camerasConsultaIds: [],
    }
  }

  if (isPortalBiSystem(systemName)) {
    return {
      ...base,
      tipoAcesso: ['Consulta'],
      portalBiReportIds: [],
    }
  }

  return base
}

export function createCollaboratorAudit(nome: string): CollaboratorAudit {
  return {
    id: crypto.randomUUID(),
    nome,
    departamento: '',
    sistemas: [],
  }
}

export const initialAuditForm: AuditFormData = {
  setor: '',
  gestorResponsavel: '',
  dataPreenchimento: '',
  colaboradores: [],
  emailRespondente: '',
  tipoVinculo: 'CLT',
  declaracao: false,
}
