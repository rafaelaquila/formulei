import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  listCameraMonitoringPermissions,
  updateCameraMonitoringPermissionReview,
} from '@/features/dashboard/api/camera-monitoring-permissions.repository'
import { logoutDashboard } from '@/features/dashboard/auth/dashboard-session'
import { DashboardAside } from '@/features/dashboard/components/DashboardAside'
import { useToast } from '@/shared/hooks/useToast'
import { AppFooter } from '@/shared/ui/Footer'
import { Toast } from '@/shared/ui/Toast'
import { Card, Field } from '@/shared/ui/ui'
import type { CameraMonitoringPermissionRow } from '@/shared/types/audit'

type CameraItemReviewStatus = CameraMonitoringPermissionRow['parecerDiretoria']
interface CameraItemReview {
  status: CameraItemReviewStatus
  observacao: string
}
type CameraItemReviewMap = Record<string, CameraItemReview>

const CAMERA_ITEM_REVIEW_STORAGE_KEY = 'formulei_camera_item_reviews_v1'

function parseCameraItems(acessoCamera: string): string[] {
  const match = acessoCamera.match(/Câmeras com acesso a consultar:\s*(.*)/s)
  const listRaw = match?.[1] ?? ''
  return listRaw
    .split(/\s;\s|\s\|\s|\n+/g)
    .map((item) => item.trim())
    .filter((item) => item.length > 0 && item !== 'Não informado')
}

function reviewKey(rowId: string, cameraItem: string) {
  return `${rowId}::${cameraItem}`
}
function readCameraItemReviews(): CameraItemReviewMap {
  if (typeof window === 'undefined') return {}
  const raw = window.localStorage.getItem(CAMERA_ITEM_REVIEW_STORAGE_KEY)
  if (!raw) return {}
  try {
    return JSON.parse(raw) as CameraItemReviewMap
  } catch {
    return {}
  }
}
function writeCameraItemReviews(data: CameraItemReviewMap) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(CAMERA_ITEM_REVIEW_STORAGE_KEY, JSON.stringify(data))
}
function toParecerFilter(value: string): '' | CameraItemReviewStatus {
  if (value === '' || value === 'Pendente' || value === 'De acordo' || value === 'Não de acordo') {
    return value
  }
  return ''
}

export function CameraMonitoringPermissionsPage() {
  const [rows, setRows] = useState<CameraMonitoringPermissionRow[]>([])
  const [loading, setLoading] = useState(true)
  const [setorFilter, setSetorFilter] = useState('')
  const [nomeFilter, setNomeFilter] = useState('')
  const [cameraFilter, setCameraFilter] = useState('')
  const [parecerFilter, setParecerFilter] = useState<'' | CameraItemReviewStatus>('')
  const [savingRowId, setSavingRowId] = useState<string | null>(null)
  const [selectedRow, setSelectedRow] = useState<CameraMonitoringPermissionRow | null>(null)
  const [itemReviews, setItemReviews] = useState<CameraItemReviewMap>({})
  const { toast, showToast } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    setItemReviews(readCameraItemReviews())
  }, [])
  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        setRows(await listCameraMonitoringPermissions())
      } catch {
        showToast('Não foi possível carregar permissões de monitoramento.', 'error')
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
    () => Array.from(new Set(rows.map((row) => row.colaborador))).sort((a, b) => a.localeCompare(b)),
    [rows],
  )

  function getRowSummary(row: CameraMonitoringPermissionRow, source: CameraItemReviewMap) {
    const items = parseCameraItems(row.acessoCamera)
    if (items.length === 0) {
      return { status: 'Pendente' as CameraItemReviewStatus, total: 0, deAcordo: 0, naoDeAcordo: 0 }
    }
    let deAcordo = 0
    let naoDeAcordo = 0
    for (const item of items) {
      const status = source[reviewKey(row.id, item)]?.status ?? 'Pendente'
      if (status === 'De acordo') deAcordo += 1
      if (status === 'Não de acordo') naoDeAcordo += 1
    }
    const status: CameraItemReviewStatus =
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
        cameraFilter.trim() &&
        !row.acessoCamera.toLowerCase().includes(cameraFilter.trim().toLowerCase())
      ) {
        return false
      }
      if (parecerFilter && rowSummaries.get(row.id)?.status !== parecerFilter) return false
      return true
    })
  }, [rows, setorFilter, nomeFilter, cameraFilter, parecerFilter, rowSummaries])

  async function handleUpdateReview(
    rowId: string,
    patch: Partial<Pick<CameraMonitoringPermissionRow, 'parecerDiretoria' | 'observacaoDiretoria'>>,
  ) {
    const current = rows.find((row) => row.id === rowId)
    if (!current) return
    const next = { ...current, ...patch }
    const previous = current
    setRows((curr) => curr.map((row) => (row.id === rowId ? next : row)))
    setSavingRowId(rowId)
    try {
      await updateCameraMonitoringPermissionReview({
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

  function reviewStatusClass(status: CameraItemReviewStatus) {
    if (status === 'De acordo') return 'bi-status-de-acordo'
    if (status === 'Não de acordo') return 'bi-status-nao-de-acordo'
    return 'bi-status-pendente'
  }

  function updateCameraItem(rowId: string, cameraItem: string, patch: Partial<CameraItemReview>) {
    const key = reviewKey(rowId, cameraItem)
    setItemReviews((current) => {
      const next = {
        ...current,
        [key]: {
          status: current[key]?.status ?? 'Pendente',
          observacao: current[key]?.observacao ?? '',
          ...patch,
        },
      }
      writeCameraItemReviews(next)
      return next
    })
  }

  async function saveModalReviews() {
    if (!selectedRow) return
    const items = parseCameraItems(selectedRow.acessoCamera)
    const summary = getRowSummary(selectedRow, itemReviews)
    const observacoes = items
      .map((item) => {
        const cameraReview = itemReviews[reviewKey(selectedRow.id, item)]
        if (!cameraReview || !cameraReview.observacao.trim()) return null
        return `${item}: ${cameraReview.observacao.trim()}`
      })
      .filter((line): line is string => Boolean(line))
      .join('\n')
    await handleUpdateReview(selectedRow.id, {
      parecerDiretoria: summary.status,
      observacaoDiretoria: observacoes,
    })
    setSelectedRow(null)
    showToast('Validação por câmera salva com sucesso.', 'success')
  }

  return (
    <main className="page">
      <header className="page-header">
        <div>
          <p className="badge">Formulei</p>
          <h1 className="page-title">Permissão Monitoramento de Câmeras</h1>
          <p className="subtitle">Validação individual de câmeras por colaborador e setor.</p>
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
              <Field label="Setor" htmlFor="camera-filter-setor">
                <select
                  id="camera-filter-setor"
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
              <Field label="Colaborador" htmlFor="camera-filter-colaborador">
                <select
                  id="camera-filter-colaborador"
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
              <Field label="Câmera (texto)" htmlFor="camera-filter-text">
                <input
                  id="camera-filter-text"
                  placeholder="Buscar por unidade ou nome da câmera..."
                  value={cameraFilter}
                  onChange={(event) => setCameraFilter(event.target.value)}
                />
              </Field>
              <Field label="Parecer da diretoria" htmlFor="camera-filter-parecer">
                <select
                  id="camera-filter-parecer"
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
                      <th>Câmeras cadastradas</th>
                      <th>Validação por câmera</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((row) => (
                      <tr key={row.id}>
                        <td>{row.setor}</td>
                        <td>{row.colaborador}</td>
                        <td>{parseCameraItems(row.acessoCamera).length}</td>
                        <td>
                          <div className="bi-review-row">
                            <button
                              type="button"
                              className="btn btn-outlined"
                              onClick={() => setSelectedRow(row)}
                            >
                              Validar câmeras
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
            aria-label="Validação individual dos acessos de câmeras"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="bi-modal-header">
              <div>
                <h2 className="section-title">Validação individual de câmeras</h2>
                <p className="subtitle">
                  {selectedRow.setor} - {selectedRow.colaborador}
                </p>
              </div>
              <button type="button" className="btn btn-outlined" onClick={() => setSelectedRow(null)}>
                Fechar
              </button>
            </header>
            <div className="bi-modal-content">
              {parseCameraItems(selectedRow.acessoCamera).map((item) => {
                const current = itemReviews[reviewKey(selectedRow.id, item)] ?? {
                  status: 'Pendente' as CameraItemReviewStatus,
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
                            updateCameraItem(selectedRow.id, item, {
                              status: event.target.value as CameraItemReviewStatus,
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
                          placeholder="Ex.: câmera não deve estar no escopo desse colaborador."
                          value={current.observacao}
                          onChange={(event) =>
                            updateCameraItem(selectedRow.id, item, {
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
