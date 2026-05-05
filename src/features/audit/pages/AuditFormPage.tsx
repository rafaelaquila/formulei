import { EMPLOYMENT_TYPES, SYSTEM_SUGGESTIONS } from '@/shared/constants/audit'
import { SystemAccessDetails } from '@/features/audit/components/SystemAccessDetails'
import {
  listCollaborators,
  listSectors,
} from '@/features/collaborators/api/collaborators.repository'
import { useAuditForm } from '@/features/audit/hooks/useAuditForm'
import { MultiCombobox } from '@/components/ui/multi-combobox'
import { AppFooter } from '@/shared/ui/Footer'
import { Toast } from '@/shared/ui/Toast'
import { Button, Card, Field } from '@/shared/ui/ui'
import type { AuditFormData } from '@/shared/types/audit'
import { useEffect, useState } from 'react'


export function AuditFormPage() {
  const {
    form,
    setForm,
    clearDraft,
    setSelectedCollaboratorNames,
    updateCollaborator,
    toggleSystemForCollaborator,
    updateSelectedSystemForCollaborator,
    handleSubmit,
    isLoading,
    toast,
  } = useAuditForm()
  const [collaboratorOptions, setCollaboratorOptions] = useState<
    { value: string; label: string; description?: string }[]
  >([])
  const [sectorOptions, setSectorOptions] = useState<string[]>([])
  const [activeCollaboratorId, setActiveCollaboratorId] = useState<string | null>(null)

  useEffect(() => {
    async function loadCollaboratorsAndSectors() {
      try {
        const [rows, sectors] = await Promise.all([
          listCollaborators(),
          listSectors(),
        ])
        setCollaboratorOptions(
          rows.map((row) => ({
            value: row.nome,
            label: row.nome,
            description: row.setor ?? undefined,
          })),
        )
        setSectorOptions(sectors)
      } catch {
        setCollaboratorOptions([])
        setSectorOptions([])
      }
    }

    void loadCollaboratorsAndSectors()
  }, [])

  const activeCollaborator =
    form.colaboradores.find((item) => item.id === activeCollaboratorId) ??
    form.colaboradores[0] ??
    null

  return (
    <main className="page">
      <header className="page-header">
        <div>
          <p className="badge">Formulei</p>
          <h1 className="page-title">Programa de Auditoria de Software - Comtrasil</h1>
          <p className="page-subtitle">Levantamento de auditoria de acesso</p>
        </div>
      </header>

      <form className="stack" onSubmit={handleSubmit} noValidate>
        <Card title="1. Dados da auditoria e colaborador">
          <div className="grid grid-2">
            <Field label="Setor" htmlFor="setor">
              <select
                id="setor"
                value={form.setor}
                onChange={(event) => setForm({ ...form, setor: event.target.value })}
              >
                <option value="">Selecione um setor</option>
                {sectorOptions.map((sector) => (
                  <option key={sector} value={sector}>
                    {sector}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Gestor responsável" htmlFor="gestor">
              <input
                id="gestor"
                value={form.gestorResponsavel}
                onChange={(event) =>
                  setForm({ ...form, gestorResponsavel: event.target.value })
                }
              />
            </Field>

            <Field label="Nomes do colaboradores">
              <MultiCombobox
                options={collaboratorOptions}
                values={form.colaboradores.map((item) => item.nome)}
                placeholder="Selecione os colaboradores"
                searchPlaceholder="Buscar colaborador..."
                emptyText="Nenhum colaborador encontrado no histórico."
                onChange={setSelectedCollaboratorNames}
              />
            </Field>

            <Field label="Seu e-mail" htmlFor="email-respondente">
              <input
                id="email-respondente"
                type="email"
                autoComplete="email"
                placeholder="nome@empresa.com.br"
                value={form.emailRespondente}
                onChange={(event) =>
                  setForm({ ...form, emailRespondente: event.target.value })
                }
              />
            </Field>

            <Field label="Tipo de vínculo" htmlFor="tipo-vinculo">
              <select
                id="tipo-vinculo"
                value={form.tipoVinculo}
                onChange={(event) =>
                  setForm({
                    ...form,
                    tipoVinculo: event.target.value as AuditFormData['tipoVinculo'],
                  })
                }
              >
                {EMPLOYMENT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </Card>

        <section className="stack">
          <div className="section-header">
          </div>
          <Card title="2. Acessos a Sistemas">
            <p style={{ fontSize: '0.8rem', color: '#787778' }}>Colaboradores selecionados e sistemas utilizados</p>
            {form.colaboradores.length === 0 ? (
              <p>Selecione ao menos um colaborador para configurar os acessos.</p>
            ) : (
              <div className="stack">
                <div className="actions-row">
                  {form.colaboradores.map((collab) => (
                    <button
                      key={collab.id}
                      type="button"
                      className={
                        activeCollaboratorId === collab.id
                          ? 'btn btn-secondary'
                          : 'btn btn-outlined'
                      }
                      onClick={() => setActiveCollaboratorId(collab.id)}
                    >
                      {collab.nome}
                    </button>
                  ))}
                </div>

                {activeCollaborator ? (
                  <div className="fieldset">
                    <h3 className="subsection-title">{activeCollaborator.nome}</h3>

                    <Field
                      label={`Departamento do colaborador ${activeCollaborator.nome}`}
                      htmlFor={`departamento-collab-${activeCollaborator.id}`}
                    >
                      <input
                        id={`departamento-collab-${activeCollaborator.id}`}
                        value={activeCollaborator.departamento}
                        onChange={(event) =>
                          updateCollaborator(activeCollaborator.id, (current) => ({
                            ...current,
                            departamento: event.target.value,
                          }))
                        }
                      />
                    </Field>

                    <div className="checkbox-grid">
                      {SYSTEM_SUGGESTIONS.map((systemName) => (
                        <label key={`${activeCollaborator.id}-${systemName}`}>
                          <input
                            type="checkbox"
                            checked={activeCollaborator.sistemas.some(
                              (item) => item.sistema === systemName,
                            )}
                            onChange={(event) =>
                              toggleSystemForCollaborator(
                                activeCollaborator.id,
                                systemName,
                                event.target.checked,
                              )
                            }
                          />
                          {systemName}
                        </label>
                      ))}
                    </div>

                    {activeCollaborator.sistemas.map((system) => (
                      <div className="fieldset" key={system.id}>
                        <h3 className="subsection-title">{system.sistema}</h3>

                        <SystemAccessDetails
                          system={system}
                          updateSelectedSystem={(systemName, updater) =>
                            updateSelectedSystemForCollaborator(
                              activeCollaborator.id,
                              systemName,
                              updater,
                            )
                          }
                        />

                        <div className="grid">
                          <Field label="Observações do sistema" htmlFor={`observacoes-${system.id}`}>
                            <textarea
                              id={`observacoes-${system.id}`}
                              value={system.observacoesSistema}
                              onChange={(event) =>
                                updateSelectedSystemForCollaborator(
                                  activeCollaborator.id,
                                  system.sistema,
                                  (current) => ({
                                    ...current,
                                    observacoesSistema: event.target.value,
                                  }),
                                )
                              }
                              rows={3}
                              placeholder="Ex.: Observações sobre uso, frequência e contexto operacional deste sistema."
                            />
                          </Field>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            )}
          </Card>
        </section>

        <Card title="3. Declaração">
          <div className="grid">
            <label className="declaration">
              <input
                type="checkbox"
                checked={form.declaracao}
                onChange={(event) =>
                  setForm({ ...form, declaracao: event.target.checked })
                }
              />
              Declaro que revisei as informações e confirmo que os acessos são
              necessários.
            </label>
          </div>
        </Card>

        <div className="actions">
          <Button type="button" variant="outlined" onClick={clearDraft}>
            Limpar rascunho
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Enviando...' : 'Enviar formulário'}
          </Button>
        </div>
      </form>
      {toast ? <Toast message={toast.message} type={toast.type} /> : null}
      <AppFooter />
    </main>
  )
}
