import { UserPlus } from 'lucide-react'
import { EMPLOYMENT_TYPES, SYSTEM_SUGGESTIONS } from '@/shared/constants/audit'
import { SystemAccessDetails } from '@/features/audit/components/SystemAccessDetails'
import {
  listCollaborators,
  listSectors,
} from '@/features/collaborators/api/collaborators.repository'
import {
  RegisterCollaboratorModal,
  type CreatedCollaborator,
} from '@/features/collaborators/components/RegisterCollaboratorModal'
import { useAuditForm } from '@/features/audit/hooks/useAuditForm'
import { MultiCombobox } from '@/components/ui/multi-combobox'
import { AppFooter } from '@/shared/ui/Footer'
import { Toast } from '@/shared/ui/Toast'
import { Button, Card, Field } from '@/shared/ui/ui'
import type { AuditFormData } from '@/shared/types/audit'
import { useEffect, useState } from 'react'

const JOURNEY_SYSTEM_NAME = 'Jorney'

function isJuridicoSetor(setor: string): boolean {
  const normalized = setor
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
  return normalized === 'juridico'
}

function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
}

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
    showToast,
  } = useAuditForm()
  const [collaboratorOptions, setCollaboratorOptions] = useState<
    { value: string; label: string; description?: string }[]
  >([])
  const [sectorOptions, setSectorOptions] = useState<string[]>([])
  const [activeCollaboratorId, setActiveCollaboratorId] = useState<string | null>(null)
  const [registerModalOpen, setRegisterModalOpen] = useState(false)
  const [registerModalNome, setRegisterModalNome] = useState('')

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
  const systemSuggestions = isJuridicoSetor(form.setor)
    ? SYSTEM_SUGGESTIONS
    : SYSTEM_SUGGESTIONS.filter((system) => system !== JOURNEY_SYSTEM_NAME)
  const filteredCollaboratorOptions = !form.setor.trim()
    ? collaboratorOptions
    : collaboratorOptions.filter(
        (option) =>
          option.description && normalizeText(option.description) === normalizeText(form.setor),
      )

  function openRegisterModal(nome: string) {
    setRegisterModalNome(nome.trim())
    setRegisterModalOpen(true)
  }

  function handleCollaboratorCreated(created: CreatedCollaborator) {
    const option = {
      value: created.nome,
      label: created.nome,
      description: created.setor,
    }
    setCollaboratorOptions((current) => {
      if (current.some((item) => normalizeText(item.value) === normalizeText(created.nome))) {
        return current
      }
      return [...current, option].sort((a, b) => a.label.localeCompare(b.label))
    })
    if (!sectorOptions.some((s) => normalizeText(s) === normalizeText(created.setor))) {
      setSectorOptions((current) => [...current, created.setor].sort((a, b) => a.localeCompare(b)))
    }
    const nextNames = Array.from(
      new Set([...form.colaboradores.map((item) => item.nome), created.nome]),
    )
    setSelectedCollaboratorNames(nextNames)
    setRegisterModalOpen(false)
    showToast(`${created.nome} cadastrado e adicionado à seleção.`, 'success')
  }

  function renderCollaboratorEmpty({ search }: { search: string }) {
    const query = search.trim()
    const hasSetor = Boolean(form.setor.trim())

    if (!query) {
      return (
        <div className="combobox-empty-register">
          <p className="combobox-empty-message">
            {hasSetor ? (
              <>
                Nenhum colaborador cadastrado em <strong>{form.setor}</strong> ainda.
              </>
            ) : (
              <>Nenhum colaborador cadastrado no diretório ainda.</>
            )}
          </p>
          <Button
            type="button"
            variant="secondary"
            className="mt-2 w-full"
            onClick={() => openRegisterModal('')}
          >
            <UserPlus className="h-4 w-4" />
            {hasSetor ? 'Cadastrar colaborador neste setor' : 'Cadastrar colaborador'}
          </Button>
        </div>
      )
    }

    return (
      <div className="combobox-empty-register">
        <p className="combobox-empty-message">
          {hasSetor ? (
            <>
              Não encontramos <strong>&quot;{query}&quot;</strong> em{' '}
              <strong>{form.setor}</strong>.
            </>
          ) : (
            <>
              Não encontramos <strong>&quot;{query}&quot;</strong> no cadastro de
              colaboradores.
            </>
          )}
        </p>
        <p className="combobox-empty-hint">
          Esse nome ainda não está cadastrado. Inclua o colaborador para seguir com a auditoria.
        </p>
        <Button
          type="button"
          className="mt-2 w-full"
          onClick={() => openRegisterModal(query)}
        >
          <UserPlus className="h-4 w-4" />
          Cadastrar &quot;{query}&quot;
        </Button>
      </div>
    )
  }

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
                onChange={(event) => {
                  const nextSetor = event.target.value
                  const shouldKeepJourney = isJuridicoSetor(nextSetor)
                  const isSetorSelected = nextSetor.trim().length > 0
                  const allowedCollaboratorNames = new Set(
                    collaboratorOptions
                      .filter(
                        (option) =>
                          !isSetorSelected ||
                          (option.description &&
                            normalizeText(option.description) === normalizeText(nextSetor)),
                      )
                      .map((option) => option.value),
                  )
                  setForm({
                    ...form,
                    setor: nextSetor,
                    colaboradores: form.colaboradores
                      .filter(
                        (colaborador) =>
                          !isSetorSelected || allowedCollaboratorNames.has(colaborador.nome),
                      )
                      .map((colaborador) => ({
                        ...colaborador,
                        sistemas: shouldKeepJourney
                          ? colaborador.sistemas
                          : colaborador.sistemas.filter(
                              (sistema) => sistema.sistema !== JOURNEY_SYSTEM_NAME,
                            ),
                      })),
                  })
                }}
              >
                <option value="">Selecione um setor</option>
                {sectorOptions.map((sector) => (
                  <option key={sector} value={sector}>
                    {sector}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Nome completo do gestor responsável" htmlFor="gestor">
              <input
                id="gestor"
                value={form.gestorResponsavel}
                onChange={(event) =>
                  setForm({ ...form, gestorResponsavel: event.target.value })
                }
              />
            </Field>

            <Field label="Nomes dos colaboradores">
              <MultiCombobox
                options={filteredCollaboratorOptions}
                values={form.colaboradores.map((item) => item.nome)}
                placeholder={
                  form.setor.trim()
                    ? 'Selecione os colaboradores do setor'
                    : 'Selecione colaboradores (todos os setores)'
                }
                searchPlaceholder="Buscar colaborador..."
                renderEmpty={renderCollaboratorEmpty}
                onChange={setSelectedCollaboratorNames}
              />
            </Field>

            <Field label="Seu e-mail" htmlFor="email-respondente" className="h-[0px]">
              <input
                id="email-respondente"
                type="email"
                autoComplete="email"
                placeholder="nome@comtrasil.com.br"
                value={form.emailRespondente}
                onChange={(event) =>
                  setForm({ ...form, emailRespondente: event.target.value })
                }
              />
            </Field>

            <Field label="Tipo de vínculo" htmlFor="tipo-vinculo" className="field-span-full">
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
            <p style={{ fontSize: '0.8rem', color: '#787778' }}>Colaboradores selecionados e sistemas utilizados (clique no nome do colaborador para editar os acessos)</p>
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
                      {systemSuggestions.map((systemName) => (
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
      <RegisterCollaboratorModal
        open={registerModalOpen}
        initialNome={registerModalNome}
        defaultSetor={form.setor}
        sectorOptions={
          form.setor.trim() && !sectorOptions.includes(form.setor)
            ? [...sectorOptions, form.setor].sort((a, b) => a.localeCompare(b))
            : sectorOptions
        }
        onClose={() => setRegisterModalOpen(false)}
        onCreated={handleCollaboratorCreated}
      />

      {toast ? <Toast message={toast.message} type={toast.type} /> : null}
      <AppFooter />
    </main>
  )
}
