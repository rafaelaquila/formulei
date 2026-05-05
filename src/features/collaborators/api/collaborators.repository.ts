import { readLocalSubmissions } from '@/features/audit/storage/local-submissions'
import { supabase } from '@/lib/supabase/client'
import type { CollaboratorDirectoryEntry } from '@/shared/types/audit'

export async function listCollaborators(): Promise<CollaboratorDirectoryEntry[]> {
  if (!supabase) {
    const names = Array.from(
      new Set(
        readLocalSubmissions()
          .flatMap((item) => item.payload.colaboradores.map((colab) => colab.nome) ?? [])
          .map((name) => name.trim())
          .filter(Boolean),
      ),
    )
    return names.map((nome, index) => ({
      id: `local-${index}`,
      nome,
      cpf: null,
      setor: null,
      createdAt: new Date(0).toISOString(),
    }))
  }

  const { data, error } = await supabase
    .from('colaboradores_diretorio')
    .select('id, nome, cpf, setor, created_at')
    .order('nome', { ascending: true })

  if (error) throw error

  return (data ?? []).map((row) => ({
    id: row.id as string,
    nome: row.nome as string,
    cpf: (row.cpf as string | null) ?? null,
    setor: (row.setor as string | null) ?? null,
    createdAt: row.created_at as string,
  }))
}

export async function createCollaborator(input: {
  nome: string
  cpf?: string
  setor?: string
}) {
  if (!supabase) return

  const cpf = input.cpf?.trim() || null
  const setor = input.setor?.trim() || null

  const { error } = await supabase.from('colaboradores_diretorio').insert({
    nome: input.nome.trim(),
    cpf,
    setor,
  })
  if (error) throw error
}

export async function listSectors(): Promise<string[]> {
  if (!supabase) {
    return Array.from(
      new Set(
        readLocalSubmissions()
          .map((item) => item.payload.setor?.trim())
          .filter((setor): setor is string => Boolean(setor)),
      ),
    ).sort((a, b) => a.localeCompare(b))
  }

  const { data, error } = await supabase
    .from('colaboradores_diretorio')
    .select('setor')
    .not('setor', 'is', null)
    .order('setor', { ascending: true })

  if (error) throw error

  return Array.from(
    new Set(
      (data ?? [])
        .map((row) => (row.setor as string | null)?.trim())
        .filter((setor): setor is string => Boolean(setor)),
    ),
  )
}
