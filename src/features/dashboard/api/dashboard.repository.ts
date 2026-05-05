import { readLocalSubmissions } from '@/features/audit/storage/local-submissions'
import { supabase } from '@/lib/supabase/client'
import type { AuditFormData, DashboardInsight } from '@/shared/types/audit'

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
    .select('utiliza, tipos_acesso, observacoes, status, ajuste, sistemas(nome)')

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
  const alertas: string[] = []

  for (const acesso of accessData) {
    const sistemaNome =
      (acesso.sistemas as { nome?: string } | null)?.nome ?? 'Não identificado'
    sistemaMap[sistemaNome] = (sistemaMap[sistemaNome] ?? 0) + 1

    for (const tipo of (acesso.tipos_acesso as string[] | null) ?? []) {
      tipoMap[tipo] = (tipoMap[tipo] ?? 0) + 1
    }

    if (
      ((acesso.tipos_acesso as string[] | null) ?? []).includes('Administração') &&
      !acesso.observacoes
    ) {
      alertas.push(`Acesso administrativo sem observações em ${sistemaNome}.`)
    }

    if (acesso.utiliza === false) {
      alertas.push(`Colaborador com acesso marcado como não utiliza em ${sistemaNome}.`)
    }

    if (!acesso.observacoes) {
      alertas.push(`Acesso sem observações preenchidas em ${sistemaNome}.`)
    }

    if (
      ((acesso.tipos_acesso as string[] | null) ?? []).length > 5 ||
      acesso.status === 'Não adequado'
    ) {
      alertas.push(`Sistema ${sistemaNome} com excesso/risco de permissões.`)
    }
  }

  return {
    totalFormularios,
    sistemasMaisUtilizados: toSortedList(sistemaMap, 'sistema'),
    acessosPorSetor: toSortedList(acessosPorSetorMap, 'setor'),
    tiposAcessoComuns: toSortedList(tipoMap, 'tipo'),
    alertas: uniqueMessages(alertas),
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

function uniqueMessages(messages: string[]) {
  return Array.from(new Set(messages))
}

function buildInsightsFromPayloads(payloads: AuditFormData[]): DashboardInsight {
  const setorMap: Record<string, number> = {}
  const sistemaMap: Record<string, number> = {}
  const tipoMap: Record<string, number> = {}
  const alertas: string[] = []

  payloads.forEach((payload) => {
    setorMap[payload.setor] = (setorMap[payload.setor] ?? 0) + 1

    ;(payload.colaboradores ?? []).forEach((colaborador) => {
      colaborador.sistemas.forEach((sistema) => {
        sistemaMap[sistema.sistema] = (sistemaMap[sistema.sistema] ?? 0) + 1
        sistema.tipoAcesso.forEach((tipo) => {
          tipoMap[tipo] = (tipoMap[tipo] ?? 0) + 1
        })

        if (
          sistema.tipoAcesso.includes('Administração') &&
          !sistema.observacoesSistema.trim()
        ) {
          alertas.push(
            `Usuário com acesso administrativo sem observações (${sistema.sistema}).`,
          )
        }

        if (sistema.utilizaSistema === 'Não' && sistema.tipoAcesso.length > 0) {
          alertas.push(`Usuário possui acesso mas não utiliza (${sistema.sistema}).`)
        }

        if (!sistema.observacoesSistema.trim()) {
          alertas.push(`Acesso sem observações (${sistema.sistema}).`)
        }

        if (sistema.tipoAcesso.length > 5) {
          alertas.push(`Sistema com excesso de permissões (${sistema.sistema}).`)
        }
      })
    })
  })

  return {
    totalFormularios: payloads.length,
    sistemasMaisUtilizados: toSortedList(sistemaMap, 'sistema'),
    acessosPorSetor: toSortedList(setorMap, 'setor'),
    tiposAcessoComuns: toSortedList(tipoMap, 'tipo'),
    alertas: uniqueMessages(alertas),
  }
}
