import { Link, useLocation } from 'react-router-dom'

const LINKS = [
  { to: '/dashboard', label: 'Visão geral' },
  { to: '/dashboard/colaboradores', label: 'Gerir colaboradores' },
  { to: '/dashboard/permissao-portal-bi', label: 'Permissão Portal BI' },
  { to: '/dashboard/permissao-monitoramento-cameras', label: 'Permissão Monitoramento Câmeras' },
] as const

export function DashboardAside() {
  const location = useLocation()

  return (
    <aside className="dashboard-aside">
      <h3 className="dashboard-aside-title">Dashboard</h3>
      <nav className="dashboard-aside-nav" aria-label="Navegação do dashboard">
        {LINKS.map((item) => {
          const active = location.pathname === item.to
          return (
            <Link
              key={item.to}
              to={item.to}
              className={active ? 'dashboard-link dashboard-link-active' : 'dashboard-link'}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
