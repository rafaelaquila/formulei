import { SYSTEM_SUGGESTIONS } from '@/shared/constants/audit'
import { isCameraFromUnit, type CameraUnit } from '@/shared/constants/camera-catalog'
import {
  isMonitoramentoCameraSystem,
  isPortalBiSystem,
} from '@/shared/constants/system-ids'
import {
  isValidBrazilianDate,
} from '@/shared/lib/br-date'
import { orderedSelectedAccessTypes } from '@/shared/lib/access-order'
import { sortSystemAccessesByCatalog } from '@/shared/lib/system-order'
import type { AuditFormData, SystemAccess } from '@/shared/types/audit'

export function normalizeSelectedAccesses(sistemas: SystemAccess[]) {
  const uniqueBySystem = new Map<string, SystemAccess>()

  for (const sistema of sistemas) {
    if (!(SYSTEM_SUGGESTIONS as readonly string[]).includes(sistema.sistema)) {
      continue
    }
    if (!uniqueBySystem.has(sistema.sistema)) {
      const semFilial = {
        ...(sistema as SystemAccess & {
          consultaFilial?: unknown
          statusAcesso?: unknown
          ajusteNecessario?: unknown
        }),
      }
      delete semFilial.consultaFilial
      delete semFilial.statusAcesso
      delete semFilial.ajusteNecessario
      let merged: SystemAccess = {
        ...semFilial,
        observacoesPorTipoAcesso: semFilial.observacoesPorTipoAcesso ?? {},
        cameraMonitoringUnit: (semFilial.cameraMonitoringUnit ?? 'Matriz Brumado') as
          | 'Matriz Brumado'
          | 'Filial Vitória da Conquista',
        camerasConsultaIds: semFilial.camerasConsultaIds ?? [],
        portalBiReportIds: semFilial.portalBiReportIds ?? [],
      }
      if (isMonitoramentoCameraSystem(sistema.sistema) || isPortalBiSystem(sistema.sistema)) {
        merged = { ...merged, tipoAcesso: ['Consulta'] }
      }
      uniqueBySystem.set(sistema.sistema, merged)
    }
  }

  return sortSystemAccessesByCatalog(Array.from(uniqueBySystem.values()))
}

/** Retorna mensagem de erro ou null se válido. */
export function validateAuditForm(form: AuditFormData): string | null {
  if (!form.setor.trim()) return 'Informe o setor.'
  if (!form.gestorResponsavel.trim()) return 'Informe o gestor responsável.'
  if (!isValidBrazilianDate(form.dataPreenchimento)) return 'Informe uma data válida (DD/MM/AAAA).'
  if (!form.colaboradores.length) return 'Selecione ao menos um colaborador.'
  if (!form.emailRespondente.trim()) return 'Informe seu e-mail.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.emailRespondente.trim())) {
    return 'Informe um e-mail válido.'
  }
  for (const colaborador of form.colaboradores) {
    if (!colaborador.departamento.trim()) {
      return `Informe o departamento do colaborador ${colaborador.nome}.`
    }
    const selectedAccesses = normalizeSelectedAccesses(colaborador.sistemas)
    if (selectedAccesses.length === 0) {
      return `Selecione pelo menos um sistema para ${colaborador.nome}.`
    }

    for (const sistema of selectedAccesses) {
      if (sistema.tipoAcesso.length === 0) {
        return `Selecione ao menos um tipo de acesso para ${sistema.sistema} (${colaborador.nome}).`
      }

      if (isMonitoramentoCameraSystem(sistema.sistema)) {
        const unidade = (sistema.cameraMonitoringUnit ?? 'Matriz Brumado') as CameraUnit
        if (!sistema.cameraMonitoringUnit?.trim()) {
          return `Selecione a unidade de câmeras em ${sistema.sistema} (${colaborador.nome}).`
        }
        if ((sistema.camerasConsultaIds ?? []).some((id) => !isCameraFromUnit(id, unidade))) {
          return `As câmeras selecionadas devem pertencer à unidade ${unidade} em ${sistema.sistema} (${colaborador.nome}).`
        }
        if (!sistema.camerasConsultaIds?.length) {
          return `Selecione ao menos uma câmera da unidade ${unidade} em ${sistema.sistema} (${colaborador.nome}).`
        }
      } else if (isPortalBiSystem(sistema.sistema)) {
        if (!sistema.portalBiReportIds?.length) {
          return `Selecione ao menos um relatório do Portal BI para ${sistema.sistema} (${colaborador.nome}).`
        }
      } else {
        for (const tipo of orderedSelectedAccessTypes(sistema.tipoAcesso)) {
          if (!(sistema.observacoesPorTipoAcesso[tipo] ?? '').trim()) {
            return `Preencha a observação de ${tipo} para ${sistema.sistema} (${colaborador.nome}).`
          }
        }
      }

      // Observações do sistema agora é opcional.
    }
  }

  if (!form.declaracao) return 'Aceite a declaração para enviar o formulário.'
  return null
}
