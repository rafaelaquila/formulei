import { appendLocalSubmission } from '@/features/audit/storage/local-submissions'
import { supabase } from '@/lib/supabase/client'
import { cameraLabelById } from '@/shared/constants/camera-catalog'
import { portalBiById } from '@/shared/constants/portal-bi-catalog'
import {
  isMonitoramentoCameraSystem,
  isPortalBiSystem,
} from '@/shared/constants/system-ids'
import { brazilianDateToIso } from '@/shared/lib/br-date'
import { orderedSelectedAccessTypes } from '@/shared/lib/access-order'
import type { AuditFormData, SystemAccess } from '@/shared/types/audit'

function hasMissingColumnError(error: unknown, column: string): boolean {
  if (!error || typeof error !== 'object') return false
  const message = String((error as { message?: string }).message ?? '').toLowerCase()
  const details = String((error as { details?: string }).details ?? '').toLowerCase()
  return message.includes(column.toLowerCase()) || details.includes(column.toLowerCase())
}

async function insertCollaboratorCompat(input: {
  nome: string
  departamento: string
  tipoVinculo: string
}) {
  if (!supabase) throw new Error('Supabase não configurado.')
  const collaboratorId = crypto.randomUUID()

  const variants: Array<Record<string, unknown>> = [
    {
      id: collaboratorId,
      nome: input.nome,
      departamento: input.departamento,
      tipo_vinculo: input.tipoVinculo,
      ativo: true,
    },
    {
      id: collaboratorId,
      nome: input.nome,
      cargo: input.departamento,
      tipo_vinculo: input.tipoVinculo,
      ativo: true,
    },
    {
      id: collaboratorId,
      nome: input.nome,
      cargo: input.departamento,
      departamento: input.departamento,
      tipo_vinculo: input.tipoVinculo,
      ativo: true,
    },
    {
      id: collaboratorId,
      nome: input.nome,
      departamento: input.departamento,
      tipo_vinculo: input.tipoVinculo,
    },
    {
      id: collaboratorId,
      nome: input.nome,
      cargo: input.departamento,
      tipo_vinculo: input.tipoVinculo,
    },
    {
      id: collaboratorId,
      nome: input.nome,
      departamento: input.departamento,
    },
    {
      id: collaboratorId,
      nome: input.nome,
      cargo: input.departamento,
    },
  ]

  const errors: unknown[] = []
  for (const payload of variants) {
    const { error } = await supabase.from('colaboradores').insert(payload)

    if (!error) {
      return collaboratorId
    }
    errors.push(error)
  }

  console.error('Falha ao inserir em colaboradores (todas as variantes).', errors)
  throw errors[0] ?? new Error('Falha ao inserir colaborador.')
}

function buildDetalhamento(payload: SystemAccess): string {
  if (isMonitoramentoCameraSystem(payload.sistema)) {
    const unidade = payload.cameraMonitoringUnit ?? 'Matriz Brumado'
    const cameras = (payload.camerasConsultaIds ?? [])
      .map((id) => cameraLabelById(id))
      .filter((label): label is string => Boolean(label))
    const lines: string[] = [`Unidade: ${unidade}`]
    if (cameras.length) {
      lines.push(`Câmeras com acesso a consultar: ${cameras.join('; ')}`)
    }
    const extra = payload.observacoesPorTipoAcesso.Consulta?.trim()
    if (extra) lines.push(`Observações adicionais (consulta): ${extra}`)
    return lines.join('\n')
  }

  if (isPortalBiSystem(payload.sistema)) {
    const unidade = payload.portalBiUnit ?? 'Matriz Brumado'
    const accessMode = payload.portalBiAccessMode ?? 'Interno'
    const blocos = (payload.portalBiReportIds ?? []).map((id) => {
      const report = portalBiById(id)
      return report ? `${report.nome} — ${report.nivelDados}` : id
    })
    const extra = payload.observacoesPorTipoAcesso.Consulta?.trim()
    const lines: string[] = [`Unidade: ${unidade}`, `Acesso: ${accessMode}`]
    if (blocos.length) lines.push(blocos.join('\n'))
    if (extra) lines.push(`Observações adicionais (consulta): ${extra}`)
    return lines.join('\n')
  }

  return orderedSelectedAccessTypes(payload.tipoAcesso)
    .map((tipo) => {
      const obs = payload.observacoesPorTipoAcesso[tipo]?.trim()
      return obs ? `${tipo}: ${obs}` : null
    })
    .filter((line): line is string => line !== null)
    .join('\n')
}

export async function submitAudit(payload: AuditFormData) {
  const isoDate = brazilianDateToIso(payload.dataPreenchimento)

  if (!supabase) {
    appendLocalSubmission(payload)
    return
  }

  const { data: formulario, error: formularioError } = await supabase
    .from('formularios')
    .insert({
      setor: payload.setor,
      gestor: payload.gestorResponsavel,
      cargo_gestor: 'Não informado',
      data_preenchimento: isoDate,
      email_respondente: payload.emailRespondente.trim(),
    })
    .select('id')
    .single()
  let formularioId = formulario?.id as string | undefined
  if (formularioError) {
    if (hasMissingColumnError(formularioError, 'email_respondente')) {
      const { data: fallbackFormulario, error: fallbackFormularioError } = await supabase
        .from('formularios')
        .insert({
          setor: payload.setor,
          gestor: payload.gestorResponsavel,
          cargo_gestor: 'Não informado',
          data_preenchimento: isoDate,
        })
        .select('id')
        .single()
      if (fallbackFormularioError) throw fallbackFormularioError
      formularioId = fallbackFormulario.id as string
    } else {
      throw formularioError
    }
  }
  if (!formularioId) throw new Error('Falha ao criar formulário.')

  for (const colab of payload.colaboradores) {
    const colaboradorId = await insertCollaboratorCompat({
      nome: colab.nome,
      departamento: colab.departamento,
      tipoVinculo: payload.tipoVinculo,
    })
    if (!colaboradorId) throw new Error('Falha ao criar colaborador.')

    for (const acesso of colab.sistemas) {
      const { data: existingSystem, error: systemQueryError } = await supabase
        .from('sistemas')
        .select('id')
        .ilike('nome', acesso.sistema)
        .maybeSingle()

      if (systemQueryError) throw systemQueryError

      let sistemaId = existingSystem?.id as string | undefined
      if (!sistemaId) {
        const { data: createdSystem, error: createSystemError } = await supabase
          .from('sistemas')
          .insert({ nome: acesso.sistema })
          .select('id')
          .single()

        if (createSystemError) throw createSystemError
        sistemaId = createdSystem.id as string
      }

      const { error: accessError } = await supabase.from('acessos').insert({
        formulario_id: formularioId,
        colaborador_id: colaboradorId,
        sistema_id: sistemaId,
        utiliza: acesso.utilizaSistema === 'Sim',
        tipos_acesso: acesso.tipoAcesso,
        detalhamento: buildDetalhamento(acesso),
        observacoes: acesso.observacoesSistema,
        status: 'Não informado',
        ajuste: '',
      })
      if (accessError) {
        if (hasMissingColumnError(accessError, 'observacoes')) {
          const { error: fallbackAccessError } = await supabase.from('acessos').insert({
            formulario_id: formularioId,
            colaborador_id: colaboradorId,
            sistema_id: sistemaId,
            utiliza: acesso.utilizaSistema === 'Sim',
            tipos_acesso: acesso.tipoAcesso,
            detalhamento: buildDetalhamento(acesso),
            rotina: acesso.observacoesSistema,
            status: 'Não informado',
            ajuste: '',
          })
          if (fallbackAccessError) throw fallbackAccessError
        } else {
          throw accessError
        }
      }
    }
  }
}
