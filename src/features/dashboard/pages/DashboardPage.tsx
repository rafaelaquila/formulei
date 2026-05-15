import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { getDashboardInsights } from '@/features/dashboard/api/dashboard.repository'
import { logoutDashboard } from '@/features/dashboard/auth/dashboard-session'
import { DashboardAside } from '@/features/dashboard/components/DashboardAside'
import { exportCsv } from '@/shared/lib/export-csv'
import type { DashboardInsight } from '@/shared/types/audit'
import { AppFooter } from '@/shared/ui/Footer'
import { Card } from '@/shared/ui/ui'

const PIE_COLORS = ['#0F172A', '#334155', '#64748B', '#94A3B8', '#CBD5E1']

export function DashboardPage() {
  const [insights, setInsights] = useState<DashboardInsight | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const loadedOnce = useRef(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (loadedOnce.current) return
    loadedOnce.current = true

    async function load() {
      setLoading(true)
      try {
        const result = await getDashboardInsights()
        setInsights(result)
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [])

  const filteredHistory = useMemo(() => {
    if (!insights) return []
    if (!search.trim()) return insights.historico
    const q = search.toLowerCase()
    return insights.historico.filter((row) =>
      Object.values(row).some((value) => String(value).toLowerCase().includes(q)),
    )
  }, [insights, search])

  return (
    <main className="page">
      <header className="page-header">
        <div>
          <p className="badge">Formulei</p>
          <h1 className="page-title">Dashboard de Auditoria</h1>
          <p className="subtitle">Insights para governança e compliance.</p>
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

        {loading || !insights ? (
          <p>Carregando métricas...</p>
        ) : (
          <section className="stack">
          <div className="kpi-grid">
            <Card title="Total de Formulários">
              <p className="kpi">{insights.totalFormularios}</p>
            </Card>
            <Card title="Sistemas Monitorados">
              <p className="kpi">{insights.sistemasMaisUtilizados.length}</p>
            </Card>
            <Card title="Registros no Histórico">
              <p className="kpi">{insights.historico.length}</p>
            </Card>
          </div>

          <div className="chart-grid">
            <Card title="Sistemas mais utilizados">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={insights.sistemasMaisUtilizados}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="sistema" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="total" fill="#0F172A" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card title="Tipos de acesso mais comuns">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={insights.tiposAcessoComuns}
                    nameKey="tipo"
                    dataKey="total"
                    outerRadius={90}
                    label
                  >
                    {insights.tiposAcessoComuns.map((item, index) => (
                      <Cell
                        key={`${item.tipo}-${index}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>

          <Card title="Acessos por setor">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={insights.acessosPorSetor}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="setor" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="total" fill="#334155" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card title="Histórico de cadastros">
            <div className="field">
              <span className="field-label">Busca global</span>
              <input
                placeholder="Filtrar histórico por qualquer campo"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            <button
              type="button"
              className="btn btn-outlined"
              onClick={() =>
                exportCsv(
                  'historico-formulei.csv',
                  filteredHistory.map((row) => ({ ...row } as Record<string, string | number>)),
                )
              }
            >
              Exportar CSV
            </button>
            {filteredHistory.length === 0 ? (
              <p>Nenhum registro encontrado para o filtro atual.</p>
            ) : (
              <div className="table-wrapper">
                <table className="table-simple">
                  <thead>
                    <tr>
                      <th>Data</th>
                      <th>Setor</th>
                      <th>Gestor</th>
                      <th>E-mail</th>
                      <th>Colaborador</th>
                      <th>Departamento</th>
                      <th>Vínculo</th>
                      <th>Sistema</th>
                      <th>Unidade</th>
                      <th>Tipos de acesso</th>
                      <th>Quantidade BI</th>
                      <th>Observações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHistory.map((row, index) => (
                      <tr
                        key={`${row.dataPreenchimento}-${row.colaborador}-${row.emailRespondente}-${index}`}
                      >
                        <td>{row.dataPreenchimento}</td>
                        <td>{row.setor}</td>
                        <td>{row.gestorResponsavel}</td>
                        <td>{row.emailRespondente}</td>
                        <td>{row.colaborador}</td>
                        <td>{row.departamento}</td>
                        <td>{row.tipoVinculo}</td>
                        <td>{row.sistema}</td>
                        <td>{row.unidadeMonitoramento}</td>
                        <td>{row.tiposAcesso}</td>
                        <td>{row.detalhamento}</td>
                        <td>{row.observacoesSistema}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
          </section>
        )}
      </div>
      <AppFooter />
    </main>
  )
}
