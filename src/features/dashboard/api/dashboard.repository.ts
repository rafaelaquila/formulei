import { readLocalSubmissions } from '@/features/audit/storage/local-submissions'
import { supabase } from '@/lib/supabase/client'
import { sortUnitsByCatalogOrder } from '@/shared/constants/units'
import type { AuditFormData, DashboardHistoryRow, DashboardInsight, SystemAccess } from '@/shared/types/audit'

export async function getDashboardInsights(): Promise<DashboardInsight> {
  const submissions = readLocalSubmissions()

  if (!supabase) {
    return buildInsightsFromPayloads(submissions.map((item) => item.payload))
  }

  const { data: formsData, error: formsError } = await supabase
    .from('formularios')
    .select('setor')
  const { data: accessData, error: accessError } = await supabase
    .from('acessos')
    .select('*, sistemas(nome), formularios(setor, gestor, data_preenchimento, email_respondente), colaboradores(nome, departamento, cargo, tipo_vinculo)')

  const tableNotFound =
    formsError?.code === 'PGRST205' || accessError?.code === 'PGRST205'

  if (tableNotFound || !formsData || !accessData) {
    return buildInsightsFromPayloads(submissions.map((item) => item.payload))
  }

  const totalFormularios = formsData.length
  const acessosPorSetorMap = formsData.reduce<Record<string, number>>((acc, item) => {
    acc[item.setor] = (acc[item.setor] ?? 0) + 1
    return acc
  }, {})

  const sistemaMap: Record<string, number> = {}
  const tipoMap: Record<string, number> = {}
  const historico: DashboardHistoryRow[] = []

  for (const acesso of accessData) {
    const sistemaNome =
      (acesso.sistemas as { nome?: string } | null)?.nome ?? 'Não identificado'
    sistemaMap[sistemaNome] = (sistemaMap[sistemaNome] ?? 0) + 1

    const tipos = (acesso.tipos_acesso as string[] | null) ?? []
    for (const tipo of tipos) {
      tipoMap[tipo] = (tipoMap[tipo] ?? 0) + 1
    }
    const form = acesso.formularios as
      | {
          setor?: string
          gestor?: string
          data_preenchimento?: string
          email_respondente?: string
        }
      | null
    const colab = acesso.colaboradores as
      | {
          nome?: string
          departamento?: string
          cargo?: string
          tipo_vinculo?: string
        }
      | null
    const dataRaw = String(form?.data_preenchimento ?? '').trim()

    historico.push({
      dataPreenchimento: dataRaw || 'Não informado',
      setor: String(form?.setor ?? 'Não informado').trim(),
      gestorResponsavel: String(form?.gestor ?? 'Não informado').trim(),
      emailRespondente: String(form?.email_respondente ?? 'Não informado').trim(),
      colaborador: String(colab?.nome ?? 'Não informado').trim(),
      departamento: String(colab?.departamento ?? colab?.cargo ?? 'Não informado').trim(),
      tipoVinculo: String(colab?.tipo_vinculo ?? 'Não informado').trim(),
      sistema: sistemaNome,
      unidadeMonitoramento: extractMonitoringUnit(String(acesso.detalhamento ?? '')),
      tiposAcesso: tipos.length ? tipos.join(' | ') : 'Não informado',
      detalhamento:
        sistemaNome === 'Portal BI'
          ? `${countPortalBiFromDetalhamento(
              String(acesso.detalhamento ?? ''),
            )}`
          : String(acesso.detalhamento ?? 'Não informado').trim(),
      observacoesSistema: String(acesso.observacoes ?? acesso.rotina ?? '').trim() || 'Não informado',
    })
  }

  return {
    totalFormularios,
    sistemasMaisUtilizados: toSortedList(sistemaMap, 'sistema'),
    acessosPorSetor: toSortedList(acessosPorSetorMap, 'setor'),
    tiposAcessoComuns: toSortedList(tipoMap, 'tipo'),
    historico,
  }
}

function toSortedList<T extends 'sistema' | 'setor' | 'tipo'>(
  map: Record<string, number>,
  keyName: T,
): Array<Record<T, string> & { total: number }> {
  return Object.entries(map)
    .map(([name, total]) => ({ [keyName]: name, total }) as Record<T, string> & {
      total: number
    })
    .sort((a, b) => Number(b.total) - Number(a.total))
    .slice(0, 6)
}

function buildInsightsFromPayloads(payloads: AuditFormData[]): DashboardInsight {
  const setorMap: Record<string, number> = {}
  const sistemaMap: Record<string, number> = {}
  const tipoMap: Record<string, number> = {}
  const historico: DashboardHistoryRow[] = []

  payloads.forEach((payload) => {
    setorMap[payload.setor] = (setorMap[payload.setor] ?? 0) + 1

    ;(payload.colaboradores ?? []).forEach((colaborador) => {
      colaborador.sistemas.forEach((sistema) => {
        sistemaMap[sistema.sistema] = (sistemaMap[sistema.sistema] ?? 0) + 1
        sistema.tipoAcesso.forEach((tipo) => {
          tipoMap[tipo] = (tipoMap[tipo] ?? 0) + 1
        })
        historico.push({
          dataPreenchimento: payload.dataPreenchimento || 'Não informado',
          setor: payload.setor || 'Não informado',
          gestorResponsavel: payload.gestorResponsavel || 'Não informado',
          emailRespondente: payload.emailRespondente || 'Não informado',
          colaborador: colaborador.nome || 'Não informado',
          departamento: colaborador.departamento || 'Não informado',
          tipoVinculo: payload.tipoVinculo || 'Não informado',
          sistema: sistema.sistema || 'Não informado',
          unidadeMonitoramento:
            sistema.sistema === 'Portal BI'
              ? (sistema.portalBiUnits?.length
                  ? sortUnitsByCatalogOrder(sistema.portalBiUnits).join('; ')
                  : 'Não se aplica')
              : (sistema.cameraMonitoringUnit ?? 'Não se aplica'),
          tiposAcesso: sistema.tipoAcesso.length ? sistema.tipoAcesso.join(' | ') : 'Não informado',
          detalhamento:
            sistema.sistema === 'Portal BI'
              ? `${sistema.portalBiReportIds?.length ?? 0}`
              : buildLocalDetalhamento(sistema),
          observacoesSistema: sistema.observacoesSistema?.trim() || 'Não informado',
        })
      })
    })
  })

  return {
    totalFormularios: payloads.length,
    sistemasMaisUtilizados: toSortedList(sistemaMap, 'sistema'),
    acessosPorSetor: toSortedList(setorMap, 'setor'),
    tiposAcessoComuns: toSortedList(tipoMap, 'tipo'),
    historico,
  }
}

function extractMonitoringUnit(detalhamento: string): string {
  const plural = detalhamento.match(/Unidades:\s*([^\n]+)/i)
  if (plural?.[1]) return plural[1].trim()
  const single = detalhamento.match(/Unidade:\s*([^\n]+)/i)
  return single?.[1]?.trim() || 'Não se aplica'
}

function buildLocalDetalhamento(sistema: SystemAccess) {
  if (sistema.sistema === 'Portal BI') {
    return (sistema.portalBiReportIds ?? []).join(' | ') || 'Não informado'
  }
  if (sistema.sistema === 'Monitoramento Intelbras') {
    return (sistema.camerasConsultaIds ?? []).join(' | ') || 'Não informado'
  }
  const linhas = sistema.tipoAcesso
    .map((tipo) => {
      const obs = sistema.observacoesPorTipoAcesso[tipo]?.trim()
      return obs ? `${tipo}: ${obs}` : null
    })
    .filter((item): item is string => Boolean(item))
  return linhas.join('\n') || 'Não informado'
}

function countPortalBiFromDetalhamento(detalhamento: string): number {
  const items = detalhamento
    .split('\n')
    .map((line) => line.trim())
    .filter(
      (line) =>
        line.length > 0 &&
        !line.toLowerCase().startsWith('observações adicionais') &&
        !line.toLowerCase().startsWith('unidade:') &&
        !line.toLowerCase().startsWith('unidades:') &&
        !line.toLowerCase().startsWith('acesso:'),
    )
  return items.length
}
