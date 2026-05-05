import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createCollaborator, listCollaborators } from '@/features/collaborators/api/collaborators.repository'
import { logoutDashboard } from '@/features/dashboard/auth/dashboard-session'
import { DashboardAside } from '@/features/dashboard/components/DashboardAside'
import { useToast } from '@/shared/hooks/useToast'
import { Toast } from '@/shared/ui/Toast'
import { Button, Card, Field } from '@/shared/ui/ui'
import type { CollaboratorDirectoryEntry } from '@/shared/types/audit'

export function ManageCollaboratorsPage() {
  const [items, setItems] = useState<CollaboratorDirectoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [nome, setNome] = useState('')
  const [cpf, setCpf] = useState('')
  const [setor, setSetor] = useState('')
  const [saving, setSaving] = useState(false)
  const { toast, showToast } = useToast()
  const navigate = useNavigate()

  const total = useMemo(() => items.length, [items.length])

  const refresh = async () => {
    setLoading(true)
    try {
      setItems(await listCollaborators())
    } catch {
      showToast('Não foi possível carregar colaboradores.', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
  }, [])

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!nome.trim()) {
      showToast('Informe o nome do colaborador.', 'error')
      return
    }

    setSaving(true)
    try {
      await createCollaborator({ nome, cpf, setor })
      setNome('')
      setCpf('')
      setSetor('')
      await refresh()
      showToast('Colaborador adicionado com sucesso.', 'success')
    } catch {
      showToast('Não foi possível adicionar colaborador.', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="page">
      <header className="page-header">
        <div>
          <p className="badge">Formulei</p>
          <h1 className="page-title">Gerir colaboradores</h1>
          <p className="subtitle">Cadastro base de nome, CPF e setor.</p>
        </div>
        <div className="actions-row">
          <Link className="btn btn-secondary" to="/">
            Voltar ao formulário
          </Link>
          <button
            type="button"
            className="btn btn-outlined"
            onClick={async () => {
              await logoutDashboard()
              navigate('/dashboard/login', { replace: true })
            }}
          >
            Sair
          </button>
        </div>
      </header>

      <div className="dashboard-layout">
        <DashboardAside />

        <section className="stack">
          <Card title={`Colaboradores cadastrados (${total})`}>
            {loading ? (
              <p>Carregando colaboradores...</p>
            ) : items.length === 0 ? (
              <p>Nenhum colaborador cadastrado ainda.</p>
            ) : (
              <div className="table-wrapper">
                <table className="table-simple">
                  <thead>
                    <tr>
                      <th>Nome</th>
                      <th>CPF</th>
                      <th>Setor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id}>
                        <td>{item.nome}</td>
                        <td>{item.cpf ?? '-'}</td>
                        <td>{item.setor ?? '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          <Card title="Adicionar colaborador">
            <form className="grid grid-2" onSubmit={onSubmit} noValidate>
              <Field label="Nome" htmlFor="colab-nome">
                <input
                  id="colab-nome"
                  value={nome}
                  onChange={(event) => setNome(event.target.value)}
                />
              </Field>
              <Field label="CPF" htmlFor="colab-cpf">
                <input
                  id="colab-cpf"
                  value={cpf}
                  onChange={(event) => setCpf(event.target.value)}
                  placeholder="000.000.000-00"
                />
              </Field>
              <Field label="Setor" htmlFor="colab-setor">
                <input
                  id="colab-setor"
                  value={setor}
                  onChange={(event) => setSetor(event.target.value)}
                />
              </Field>
              <div className="actions">
                <Button type="submit" disabled={saving}>
                  {saving ? 'Salvando...' : 'Adicionar'}
                </Button>
              </div>
            </form>
          </Card>
        </section>
      </div>

      {toast ? <Toast message={toast.message} type={toast.type} /> : null}
    </main>
  )
}
