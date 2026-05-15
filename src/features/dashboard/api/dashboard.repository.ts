import { readLocalSubmissions } from '@/features/audit/storage/local-submissions'
import { supabase } from '@/lib/supabase/client'
import { SYSTEM_SUGGESTIONS } from '@/shared/constants/audit'
import { portalBiById } from '@/shared/constants/portal-bi-catalog'
import { sortUnitsByCatalogOrder } from '@/shared/constants/units'
import type { AuditFormData, DashboardHistoryRow, DashboardInsight, SystemAccess } from '@/shared/types/audit'

function catalogOrderIndex(name: string): number {
  const idx = (SYSTEM_SUGGESTIONS as readonly string[]).indexOf(name)
  return idx === -1 ? 9999 : idx
}

function sortSystemNames(names: string[]): string[] {
  return [...new Set(names)].sort((a, b) => {
    const da = catalogOrderIndex(a)
    const db = catalogOrderIndex(b)
    if (da !== db) return da - db
    return a.localeCompare(b)
  })
}

/** Uma linha por colaborador em cada formulário (vários sistemas na mesma linha). */
function mergeHistoryGroup(rows: DashboardHistoryRow[]): DashboardHistoryRow {
  if (rows.length === 1) return rows[0]

  const first = rows[0]
  const sorted = [...rows].sort(
    (a, b) => catalogOrderIndex(a.sistema) - catalogOrderIndex(b.sistema),
  )
  const sistemas = sortSystemNames(sorted.map((r) => r.sistema))

  const portalBi = sorted.find((r) => r.sistema === 'Portal BI')
  const quantidadeBi = portalBi?.detalhamento ?? '—'

  const unidades = [
    ...new Set(
      sorted
        .map((r) => r.unidadeMonitoramento)
        .filter((u) => u && u !== 'Não se aplica'),
    ),
  ]
  const unidadeMonitoramento = unidades.length ? unidades.join('; ') : 'Não se aplica'

  const tiposAcesso = sorted.map((r) => `${r.sistema}: ${r.tiposAcesso}`).join(' | ')

  const observacoesParts = sorted
    .map((r) => {
      const chunks: string[] = []
      if (r.observacoesSistema && r.observacoesSistema !== 'Não informado') {
        chunks.push(r.observacoesSistema)
      }
      if (
        r.sistema !== 'Portal BI' &&
        r.detalhamento &&
        r.detalhamento !== 'Não informado' &&
        r.detalhamento !== quantidadeBi
      ) {
        chunks.push(r.detalhamento)
      }
      if (!chunks.length) return null
      return `${r.sistema}: ${chunks.join(' — ')}`
    })
    .filter((line): line is string => Boolean(line))

  return {
    ...first,
    sistema: sistemas.join(' | '),
    unidadeMonitoramento,
    tiposAcesso,
    detalhamento: quantidadeBi,
    relatoriosPortalBi: portalBi?.relatoriosPortalBi ?? '—',
    observacoesSistema: observacoesParts.length ? observacoesParts.join('\n\n') : 'Não informado',
  }
}

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
  const historicoGroups = new Map<string, DashboardHistoryRow[]>()

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
    const formularioId = String(acesso.formulario_id ?? '')
    const colaboradorId = String(acesso.colaborador_id ?? '')
    const groupKey = `${formularioId}|${colaboradorId}`

    const row: DashboardHistoryRow = {
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
          ? `${countPortalBiFromDetalhamento(String(acesso.detalhamento ?? ''))}`
          : String(acesso.detalhamento ?? 'Não informado').trim(),
      relatoriosPortalBi:
        sistemaNome === 'Portal BI'
          ? listPortalBiFromDetalhamento(String(acesso.detalhamento ?? ''))
          : undefined,
      observacoesSistema: String(acesso.observacoes ?? acesso.rotina ?? '').trim() || 'Não informado',
    }

    const group = historicoGroups.get(groupKey) ?? []
    group.push(row)
    historicoGroups.set(groupKey, group)
  }

  const historico = Array.from(historicoGroups.values()).map((group) => mergeHistoryGroup(group))

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
      const fragments: DashboardHistoryRow[] = []

      colaborador.sistemas.forEach((sistema) => {
        sistemaMap[sistema.sistema] = (sistemaMap[sistema.sistema] ?? 0) + 1
        sistema.tipoAcesso.forEach((tipo) => {
          tipoMap[tipo] = (tipoMap[tipo] ?? 0) + 1
        })
        fragments.push({
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
          relatoriosPortalBi:
            sistema.sistema === 'Portal BI'
              ? formatPortalBiReportList(sistema.portalBiReportIds ?? [])
              : undefined,
          observacoesSistema: sistema.observacoesSistema?.trim() || 'Não informado',
        })
      })

      if (fragments.length > 0) {
        historico.push(mergeHistoryGroup(fragments))
      }
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

function portalBiReportLinesFromDetalhamento(detalhamento: string): string[] {
  return detalhamento
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
}

function countPortalBiFromDetalhamento(detalhamento: string): number {
  return portalBiReportLinesFromDetalhamento(detalhamento).length
}

function listPortalBiFromDetalhamento(detalhamento: string): string {
  const items = portalBiReportLinesFromDetalhamento(detalhamento)
  return items.length ? items.join(' | ') : '—'
}

function formatPortalBiReportList(reportIds: string[]): string {
  const items = reportIds
    .map((id) => {
      const report = portalBiById(id)
      return report ? `${report.nome} — ${report.nivelDados}` : id
    })
    .filter(Boolean)
  return items.length ? items.join(' | ') : '—'
}
