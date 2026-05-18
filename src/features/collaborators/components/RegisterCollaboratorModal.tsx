import { useEffect, useState } from 'react'
import { UserPlus } from 'lucide-react'

import { createCollaborator } from '@/features/collaborators/api/collaborators.repository'
import { Button } from '@/components/ui/button'
import { Field } from '@/shared/ui/ui'

export interface CreatedCollaborator {
  nome: string
  setor: string
  cpf: string | null
}

interface Props {
  open: boolean
  initialNome?: string
  defaultSetor: string
  sectorOptions: string[]
  onClose: () => void
  onCreated: (collaborator: CreatedCollaborator) => void
}

export function RegisterCollaboratorModal({
  open,
  initialNome = '',
  defaultSetor,
  sectorOptions,
  onClose,
  onCreated,
}: Props) {
  const [nome, setNome] = useState(initialNome)
  const [cpf, setCpf] = useState('')
  const [setor, setSetor] = useState(defaultSetor)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setNome(initialNome)
    setCpf('')
    setSetor(defaultSetor)
    setError(null)
  }, [open, initialNome, defaultSetor])

  if (!open) return null

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmedNome = nome.trim()
    if (!trimmedNome) {
      setError('Informe o nome completo do colaborador.')
      return
    }
    if (!setor.trim()) {
      setError('Selecione o setor do colaborador.')
      return
    }

    setSaving(true)
    setError(null)
    try {
      await createCollaborator({
        nome: trimmedNome,
        cpf: cpf.trim() || undefined,
        setor: setor.trim(),
      })
      onCreated({
        nome: trimmedNome,
        setor: setor.trim(),
        cpf: cpf.trim() || null,
      })
    } catch {
      setError('Não foi possível cadastrar o colaborador. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bi-modal-overlay" role="presentation" onClick={onClose}>
      <section
        className="bi-modal register-collaborator-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="register-collaborator-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="bi-modal-header">
          <div className="register-collaborator-modal__intro">
            <span className="register-collaborator-modal__icon" aria-hidden>
              <UserPlus className="h-5 w-5" />
            </span>
            <div>
              <h2 id="register-collaborator-title" className="section-title">
                Cadastrar colaborador
              </h2>
              <p className="subtitle">
                Inclua no diretório para poder selecioná-lo nesta auditoria.
              </p>
            </div>
          </div>
          <button type="button" className="btn btn-outlined" onClick={onClose}>
            Fechar
          </button>
        </header>

        <form className="bi-modal-content" onSubmit={handleSubmit} noValidate>
          <Field label="Nome completo" htmlFor="register-colab-nome">
            <input
              id="register-colab-nome"
              value={nome}
              onChange={(event) => setNome(event.target.value)}
              placeholder="Ex.: Maria Silva"
              autoFocus
            />
          </Field>

          <Field label="CPF (opcional)" htmlFor="register-colab-cpf">
            <input
              id="register-colab-cpf"
              value={cpf}
              onChange={(event) => setCpf(event.target.value)}
              placeholder="000.000.000-00"
            />
          </Field>

          <Field label="Setor" htmlFor="register-colab-setor">
            <select
              id="register-colab-setor"
              value={setor}
              onChange={(event) => setSetor(event.target.value)}
            >
              <option value="">Selecione um setor</option>
              {sectorOptions.map((sector) => (
                <option key={sector} value={sector}>
                  {sector}
                </option>
              ))}
            </select>
          </Field>

          {error ? <p className="form-error">{error}</p> : null}

          <footer className="actions">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar e selecionar'}
            </Button>
          </footer>
        </form>
      </section>
    </div>
  )
}
