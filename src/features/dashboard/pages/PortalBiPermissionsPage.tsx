import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  listPortalBiPermissions,
  updatePortalBiPermissionReview,
} from '@/features/dashboard/api/portal-bi-permissions.repository'
import { logoutDashboard } from '@/features/dashboard/auth/dashboard-session'
import { DashboardAside } from '@/features/dashboard/components/DashboardAside'
import { useToast } from '@/shared/hooks/useToast'
import { AppFooter } from '@/shared/ui/Footer'
import { Toast } from '@/shared/ui/Toast'
import { Card, Field } from '@/shared/ui/ui'
import type { PortalBiPermissionRow } from '@/shared/types/audit'

type BiItemReviewStatus = PortalBiPermissionRow['parecerDiretoria']

interface BiItemReview {
  status: BiItemReviewStatus
  observacao: string
}

type BiItemReviewMap = Record<string, BiItemReview>

const BI_ITEM_REVIEW_STORAGE_KEY = 'formulei_portal_bi_item_reviews_v1'

function parseBiItems(acessoBi: string): string[] {
  return acessoBi
    .split(/\s\|\s|\n+/g)
    .map((item) => item.trim())
    .filter((item) => item.length > 0 && !item.toLowerCase().startsWith('observações adicionais'))
}

function reviewKey(rowId: string, biItem: string) {
  return `${rowId}::${biItem}`
}

function readBiItemReviews(): BiItemReviewMap {
  if (typeof window === 'undefined') return {}
  const raw = window.localStorage.getItem(BI_ITEM_REVIEW_STORAGE_KEY)
  if (!raw) return {}
  try {
    return JSON.parse(raw) as BiItemReviewMap
  } catch {
    return {}
  }
}

function writeBiItemReviews(data: BiItemReviewMap) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(BI_ITEM_REVIEW_STORAGE_KEY, JSON.stringify(data))
}

function toParecerFilter(value: string): '' | BiItemReviewStatus {
  if (value === '' || value === 'Pendente' || value === 'De acordo' || value === 'Não de acordo') {
    return value
  }
  return ''
}

export function PortalBiPermissionsPage() {
  const [rows, setRows] = useState<PortalBiPermissionRow[]>([])
  const [loading, setLoading] = useState(true)
  const [setorFilter, setSetorFilter] = useState('')
  const [nomeFilter, setNomeFilter] = useState('')
  const [acessoFilter, setAcessoFilter] = useState('')
  const [parecerFilter, setParecerFilter] = useState<'' | BiItemReviewStatus>('')
  const [savingRowId, setSavingRowId] = useState<string | null>(null)
  const [selectedRow, setSelectedRow] = useState<PortalBiPermissionRow | null>(null)
  const [itemReviews, setItemReviews] = useState<BiItemReviewMap>({})
  const { toast, showToast } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    setItemReviews(readBiItemReviews())
  }, [])

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        setRows(await listPortalBiPermissions())
      } catch {
        showToast('Não foi possível carregar permissões do Portal BI.', 'error')
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [showToast])

  const setores = useMemo(
    () => Array.from(new Set(rows.map((row) => row.setor))).sort((a, b) => a.localeCompare(b)),
    [rows],
  )
  const nomes = useMemo(
    () =>
      Array.from(new Set(rows.map((row) => row.colaborador))).sort((a, b) =>
        a.localeCompare(b),
      ),
    [rows],
  )

  function getRowSummary(row: PortalBiPermissionRow, source: BiItemReviewMap) {
    const items = parseBiItems(row.acessoBi)
    if (items.length === 0) {
      return { status: 'Pendente' as BiItemReviewStatus, total: 0, deAcordo: 0, naoDeAcordo: 0 }
    }
    let deAcordo = 0
    let naoDeAcordo = 0
    for (const item of items) {
      const current = source[reviewKey(row.id, item)]?.status ?? 'Pendente'
      if (current === 'De acordo') deAcordo += 1
      if (current === 'Não de acordo') naoDeAcordo += 1
    }
    const status: BiItemReviewStatus =
      naoDeAcordo > 0 ? 'Não de acordo' : deAcordo === items.length ? 'De acordo' : 'Pendente'
    return { status, total: items.length, deAcordo, naoDeAcordo }
  }

  const rowSummaries = useMemo(() => {
    const map = new Map<string, ReturnType<typeof getRowSummary>>()
    for (const row of rows) {
      map.set(row.id, getRowSummary(row, itemReviews))
    }
    return map
  }, [rows, itemReviews])

  const filtered = useMemo(() => {
    return rows.filter((row) => {
      if (setorFilter && row.setor !== setorFilter) return false
      if (nomeFilter && row.colaborador !== nomeFilter) return false
      if (
        acessoFilter.trim() &&
        !row.acessoBi.toLowerCase().includes(acessoFilter.trim().toLowerCase())
      ) {
        return false
      }
      if (parecerFilter && rowSummaries.get(row.id)?.status !== parecerFilter) return false
      return true
    })
  }, [rows, setorFilter, nomeFilter, acessoFilter, parecerFilter, rowSummaries])

  async function handleUpdateReview(
    rowId: string,
    patch: Partial<Pick<PortalBiPermissionRow, 'parecerDiretoria' | 'observacaoDiretoria'>>,
  ) {
    const current = rows.find((row) => row.id === rowId)
    if (!current) return
    const next = { ...current, ...patch }
    const previous = current
    setRows((curr) => curr.map((row) => (row.id === rowId ? next : row)))
    setSavingRowId(rowId)
    try {
      await updatePortalBiPermissionReview({
        rowId,
        parecerDiretoria: next.parecerDiretoria,
        observacaoDiretoria: next.observacaoDiretoria,
      })
    } catch {
      setRows((curr) => curr.map((row) => (row.id === rowId ? previous : row)))
      showToast('Não foi possível salvar o parecer da diretoria.', 'error')
    } finally {
      setSavingRowId((curr) => (curr === rowId ? null : curr))
    }
  }

  function reviewStatusClass(status: BiItemReviewStatus) {
    if (status === 'De acordo') return 'bi-status-de-acordo'
    if (status === 'Não de acordo') return 'bi-status-nao-de-acordo'
    return 'bi-status-pendente'
  }

  function updateBiItem(rowId: string, biItem: string, patch: Partial<BiItemReview>) {
    const key = reviewKey(rowId, biItem)
    setItemReviews((current) => {
      const next = {
        ...current,
        [key]: {
          status: current[key]?.status ?? 'Pendente',
          observacao: current[key]?.observacao ?? '',
          ...patch,
        },
      }
      writeBiItemReviews(next)
      return next
    })
  }

  async function saveModalReviews() {
    if (!selectedRow) return
    const items = parseBiItems(selectedRow.acessoBi)
    const summary = getRowSummary(selectedRow, itemReviews)
    const observacoes = items
      .map((item) => {
        const itemReview = itemReviews[reviewKey(selectedRow.id, item)]
        if (!itemReview || !itemReview.observacao.trim()) return null
        return `${item}: ${itemReview.observacao.trim()}`
      })
      .filter((line): line is string => Boolean(line))
      .join('\n')
    await handleUpdateReview(selectedRow.id, {
      parecerDiretoria: summary.status,
      observacaoDiretoria: observacoes,
    })
    setSelectedRow(null)
    showToast('Validação por BI salva com sucesso.', 'success')
  }

  return (
    <main className="page">
      <header className="page-header">
        <div>
          <p className="badge">Formulei</p>
          <h1 className="page-title">Permissão Portal BI</h1>
          <p className="subtitle">Visão em formato de planilha com filtros por setor e pessoa.</p>
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
          <Card title="Filtros">
            <div className="grid grid-2">
              <Field label="Setor" htmlFor="filter-setor">
                <select
                  id="filter-setor"
                  value={setorFilter}
                  onChange={(event) => setSetorFilter(event.target.value)}
                >
                  <option value="">Todos</option>
                  {setores.map((setor) => (
                    <option key={setor} value={setor}>
                      {setor}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Colaborador" htmlFor="filter-colaborador">
                <select
                  id="filter-colaborador"
                  value={nomeFilter}
                  onChange={(event) => setNomeFilter(event.target.value)}
                >
                  <option value="">Todos</option>
                  {nomes.map((nome) => (
                    <option key={nome} value={nome}>
                      {nome}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Acesso BI (texto)" htmlFor="filter-acesso">
                <input
                  id="filter-acesso"
                  placeholder="Buscar por nome do BI ou nível de dados..."
                  value={acessoFilter}
                  onChange={(event) => setAcessoFilter(event.target.value)}
                />
              </Field>
              <Field label="Parecer da diretoria" htmlFor="filter-parecer">
                <select
                  id="filter-parecer"
                  value={parecerFilter}
                  onChange={(event) => setParecerFilter(toParecerFilter(event.target.value))}
                >
                  <option value="">Todos</option>
                  <option value="Pendente">Pendente</option>
                  <option value="De acordo">De acordo</option>
                  <option value="Não de acordo">Não de acordo</option>
                </select>
              </Field>
            </div>
          </Card>

          <Card title={`Permissões encontradas (${filtered.length})`}>
            {loading ? (
              <p>Carregando permissões...</p>
            ) : filtered.length === 0 ? (
              <p>Nenhuma permissão encontrada para os filtros atuais.</p>
            ) : (
              <div className="table-wrapper">
                <table className="table-simple">
                  <thead>
                    <tr>
                      <th>Setor</th>
                      <th>Colaborador</th>
                      <th>Acessos BI cadastrados</th>
                      <th>Validação por BI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((row) => (
                      <tr key={row.id}>
                        <td>{row.setor}</td>
                        <td>{row.colaborador}</td>
                        <td>{parseBiItems(row.acessoBi).length}</td>
                        <td>
                          <div className="bi-review-row">
                            <button
                              type="button"
                              className="btn btn-outlined"
                              onClick={() => setSelectedRow(row)}
                            >
                              Validar BIs
                            </button>
                            <span
                              className={`bi-status-tag ${reviewStatusClass(rowSummaries.get(row.id)?.status ?? 'Pendente')}`}
                            >
                              {savingRowId === row.id
                                ? 'Salvando...'
                                : rowSummaries.get(row.id)?.status ?? 'Pendente'}
                            </span>
                            <span className="bi-review-progress">
                              {`${rowSummaries.get(row.id)?.deAcordo ?? 0}/${rowSummaries.get(row.id)?.total ?? 0} de acordo`}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </section>
      </div>

      {selectedRow ? (
        <div className="bi-modal-overlay" role="presentation" onClick={() => setSelectedRow(null)}>
          <section
            className="bi-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Validação individual dos acessos BI"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="bi-modal-header">
              <div>
                <h2 className="section-title">Validação individual de acessos BI</h2>
                <p className="subtitle">
                  {selectedRow.setor} - {selectedRow.colaborador}
                </p>
              </div>
              <button type="button" className="btn btn-outlined" onClick={() => setSelectedRow(null)}>
                Fechar
              </button>
            </header>

            <div className="bi-modal-content">
              {parseBiItems(selectedRow.acessoBi).map((item) => {
                const current = itemReviews[reviewKey(selectedRow.id, item)] ?? {
                  status: 'Pendente' as BiItemReviewStatus,
                  observacao: '',
                }
                return (
                  <article className="bi-item-card" key={reviewKey(selectedRow.id, item)}>
                    <p className="bi-item-title">{item}</p>
                    <div className="grid grid-2">
                      <Field label="Parecer" htmlFor={reviewKey(selectedRow.id, item)}>
                        <select
                          id={reviewKey(selectedRow.id, item)}
                          value={current.status}
                          onChange={(event) =>
                            updateBiItem(selectedRow.id, item, {
                              status: event.target.value as BiItemReviewStatus,
                            })
                          }
                        >
                          <option value="Pendente">Pendente</option>
                          <option value="De acordo">De acordo</option>
                          <option value="Não de acordo">Não de acordo</option>
                        </select>
                      </Field>
                      <Field label="Observação da diretoria (opcional)">
                        <textarea
                          rows={2}
                          placeholder="Ex.: escopo acima do necessário para a função atual."
                          value={current.observacao}
                          onChange={(event) =>
                            updateBiItem(selectedRow.id, item, {
                              observacao: event.target.value,
                            })
                          }
                        />
                      </Field>
                    </div>
                  </article>
                )
              })}
            </div>

            <footer className="actions">
              <button type="button" className="btn btn-outlined" onClick={() => setSelectedRow(null)}>
                Cancelar
              </button>
              <button type="button" className="btn btn-primary" onClick={() => void saveModalReviews()}>
                Salvar validações
              </button>
            </footer>
          </section>
        </div>
      ) : null}

      {toast ? <Toast message={toast.message} type={toast.type} /> : null}
      <AppFooter />
    </main>
  )
}
