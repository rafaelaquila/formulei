import { readLocalSubmissions } from '@/features/audit/storage/local-submissions'
import { supabase } from '@/lib/supabase/client'
import { portalBiById } from '@/shared/constants/portal-bi-catalog'
import type { PortalBiPermissionRow } from '@/shared/types/audit'

const LOCAL_BI_REVIEW_KEY = 'formulei_portal_bi_reviews_v1'

type ReviewStatus = PortalBiPermissionRow['parecerDiretoria']

interface ReviewMapItem {
  parecerDiretoria: ReviewStatus
  observacaoDiretoria: string
}

type ReviewMap = Record<string, ReviewMapItem>

function readLocalReviews(): ReviewMap {
  if (typeof window === 'undefined') return {}
  const raw = window.localStorage.getItem(LOCAL_BI_REVIEW_KEY)
  if (!raw) return {}
  try {
    return JSON.parse(raw) as ReviewMap
  } catch {
    return {}
  }
}

function writeLocalReviews(reviews: ReviewMap) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(LOCAL_BI_REVIEW_KEY, JSON.stringify(reviews))
}

export async function listPortalBiPermissions(): Promise<PortalBiPermissionRow[]> {
  const localReviews = readLocalReviews()

  if (!supabase) {
    return buildFromLocalSubmissions(localReviews)
  }

  const { data: portalBiSystem, error: systemError } = await supabase
    .from('sistemas')
    .select('id')
    .ilike('nome', 'Portal BI')
    .maybeSingle()

  if (systemError) {
    throw systemError
  }

  if (!portalBiSystem?.id) {
    return []
  }

  const { data, error } = await supabase
    .from('acessos')
    .select('id, detalhamento, status, ajuste, formularios(setor), colaboradores(nome)')
    .eq('sistema_id', portalBiSystem.id)
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return (data ?? []).map((row) => {
    const fallback = localReviews[row.id as string]
    const statusRaw = ((row.status as string | null) ?? '').trim()
    const parecerDiretoria: ReviewStatus =
      statusRaw === 'Adequado' ? 'De acordo' : statusRaw === 'Não adequado' ? 'Não de acordo' : fallback?.parecerDiretoria ?? 'Pendente'

    return {
      id: row.id as string,
      setor:
        ((row.formularios as { setor?: string } | null)?.setor ?? 'Não informado').trim(),
      colaborador:
        ((row.colaboradores as { nome?: string } | null)?.nome ?? 'Não informado').trim(),
      acessoBi: (row.detalhamento as string | null)?.trim() || 'Não informado',
      parecerDiretoria,
      observacaoDiretoria: ((row.ajuste as string | null) ?? '').trim() || fallback?.observacaoDiretoria || '',
    }
  })
}

export async function updatePortalBiPermissionReview(input: {
  rowId: string
  parecerDiretoria: ReviewStatus
  observacaoDiretoria: string
}) {
  const localReviews = readLocalReviews()
  localReviews[input.rowId] = {
    parecerDiretoria: input.parecerDiretoria,
    observacaoDiretoria: input.observacaoDiretoria.trim(),
  }
  writeLocalReviews(localReviews)

  if (!supabase) return

  const status = input.parecerDiretoria === 'De acordo'
    ? 'Adequado'
    : input.parecerDiretoria === 'Não de acordo'
      ? 'Não adequado'
      : 'Pendente'
  const ajuste = input.observacaoDiretoria.trim()

  const { error } = await supabase
    .from('acessos')
    .update({ status, ajuste })
    .eq('id', input.rowId)

  if (error) {
    throw error
  }
}

function buildFromLocalSubmissions(localReviews: ReviewMap): PortalBiPermissionRow[] {
  const rows: PortalBiPermissionRow[] = []

  for (const submission of readLocalSubmissions()) {
    const setor = submission.payload.setor?.trim() || 'Não informado'
    for (const colaborador of submission.payload.colaboradores ?? []) {
      for (const sistema of colaborador.sistemas ?? []) {
        if (sistema.sistema !== 'Portal BI') continue
        const detalhes = (sistema.portalBiReportIds ?? [])
          .map((id) => {
            const bi = portalBiById(id)
            return bi ? `${bi.nome} — ${bi.nivelDados}` : id
          })
          .join(' | ')
        rows.push({
          id: `${submission.id}-${colaborador.id}-${sistema.id}`,
          setor,
          colaborador: colaborador.nome,
          acessoBi: detalhes || 'Não informado',
          parecerDiretoria: localReviews[`${submission.id}-${colaborador.id}-${sistema.id}`]?.parecerDiretoria ?? 'Pendente',
          observacaoDiretoria:
            localReviews[`${submission.id}-${colaborador.id}-${sistema.id}`]?.observacaoDiretoria ??
            '',
        })
      }
    }
  }

  return rows
}
