import { readLocalSubmissions } from '@/features/audit/storage/local-submissions'
import { supabase } from '@/lib/supabase/client'
import { cameraLabelById } from '@/shared/constants/camera-catalog'
import { MONITORAMENTO_CAMERA_SYSTEM } from '@/shared/constants/system-ids'
import type { CameraMonitoringPermissionRow } from '@/shared/types/audit'

const LOCAL_CAMERA_REVIEW_KEY = 'formulei_camera_reviews_v1'

type ReviewStatus = CameraMonitoringPermissionRow['parecerDiretoria']

interface ReviewMapItem {
  parecerDiretoria: ReviewStatus
  observacaoDiretoria: string
}

type ReviewMap = Record<string, ReviewMapItem>

function readLocalReviews(): ReviewMap {
  if (typeof window === 'undefined') return {}
  const raw = window.localStorage.getItem(LOCAL_CAMERA_REVIEW_KEY)
  if (!raw) return {}
  try {
    return JSON.parse(raw) as ReviewMap
  } catch {
    return {}
  }
}

function writeLocalReviews(reviews: ReviewMap) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(LOCAL_CAMERA_REVIEW_KEY, JSON.stringify(reviews))
}

export async function listCameraMonitoringPermissions(): Promise<CameraMonitoringPermissionRow[]> {
  const localReviews = readLocalReviews()

  if (!supabase) {
    return buildFromLocalSubmissions(localReviews)
  }

  const { data: cameraSystem, error: systemError } = await supabase
    .from('sistemas')
    .select('id')
    .ilike('nome', MONITORAMENTO_CAMERA_SYSTEM)
    .maybeSingle()

  if (systemError) throw systemError
  if (!cameraSystem?.id) return []

  const { data, error } = await supabase
    .from('acessos')
    .select('id, detalhamento, status, ajuste, formularios(setor), colaboradores(nome)')
    .eq('sistema_id', cameraSystem.id)
    .order('created_at', { ascending: false })

  if (error) throw error

  return (data ?? []).map((row) => {
    const fallback = localReviews[row.id as string]
    const statusRaw = ((row.status as string | null) ?? '').trim()
    const parecerDiretoria: ReviewStatus =
      statusRaw === 'Adequado'
        ? 'De acordo'
        : statusRaw === 'Não adequado'
          ? 'Não de acordo'
          : fallback?.parecerDiretoria ?? 'Pendente'

    const detalhamento = (row.detalhamento as string | null)?.trim() || 'Não informado'
    return {
      id: row.id as string,
      setor: ((row.formularios as { setor?: string } | null)?.setor ?? 'Não informado').trim(),
      colaborador: ((row.colaboradores as { nome?: string } | null)?.nome ?? 'Não informado').trim(),
      unidade: extractUnidadeFromDetalhamento(detalhamento),
      acessoCamera: detalhamento,
      parecerDiretoria,
      observacaoDiretoria:
        ((row.ajuste as string | null) ?? '').trim() || fallback?.observacaoDiretoria || '',
    }
  })
}

export async function updateCameraMonitoringPermissionReview(input: {
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

  const status =
    input.parecerDiretoria === 'De acordo'
      ? 'Adequado'
      : input.parecerDiretoria === 'Não de acordo'
        ? 'Não adequado'
        : 'Pendente'
  const ajuste = input.observacaoDiretoria.trim()

  const { error } = await supabase.from('acessos').update({ status, ajuste }).eq('id', input.rowId)
  if (error) throw error
}

function extractUnidadeFromDetalhamento(detalhamento: string): string {
  const match = detalhamento.match(/Unidade:\s*([^\n]+)/i)
  return match?.[1]?.trim() || 'Não informado'
}

function buildFromLocalSubmissions(localReviews: ReviewMap): CameraMonitoringPermissionRow[] {
  const rows: CameraMonitoringPermissionRow[] = []

  for (const submission of readLocalSubmissions()) {
    const setor = submission.payload.setor?.trim() || 'Não informado'
    for (const colaborador of submission.payload.colaboradores ?? []) {
      for (const sistema of colaborador.sistemas ?? []) {
        if (sistema.sistema !== MONITORAMENTO_CAMERA_SYSTEM) continue
        const unidade = sistema.cameraMonitoringUnit ?? 'Matriz Brumado'
        const cameras = (sistema.camerasConsultaIds ?? [])
          .map((id) => cameraLabelById(id))
          .filter((item): item is string => Boolean(item))
          .join(' | ')
        rows.push({
          id: `${submission.id}-${colaborador.id}-${sistema.id}`,
          setor,
          colaborador: colaborador.nome,
          unidade,
          acessoCamera: `Unidade: ${unidade}\nCâmeras com acesso a consultar: ${cameras || 'Não informado'}`,
          parecerDiretoria:
            localReviews[`${submission.id}-${colaborador.id}-${sistema.id}`]?.parecerDiretoria ??
            'Pendente',
          observacaoDiretoria:
            localReviews[`${submission.id}-${colaborador.id}-${sistema.id}`]?.observacaoDiretoria ??
            '',
        })
      }
    }
  }

  return rows
}
