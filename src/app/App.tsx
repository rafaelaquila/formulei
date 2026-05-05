import { useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AuditFormPage } from '@/features/audit/pages/AuditFormPage'
import { ManageCollaboratorsPage } from '@/features/collaborators/pages/ManageCollaboratorsPage'
import { DashboardLoginPage } from '@/features/dashboard/pages/DashboardLoginPage'
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage'
import { CameraMonitoringPermissionsPage } from '@/features/dashboard/pages/CameraMonitoringPermissionsPage'
import { PortalBiPermissionsPage } from '@/features/dashboard/pages/PortalBiPermissionsPage'
import { getDashboardSession } from '@/features/dashboard/auth/dashboard-session'
import { supabase } from '@/lib/supabase/client'

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoadingAuth, setIsLoadingAuth] = useState(true)

  useEffect(() => {
    async function bootstrap() {
      const session = await getDashboardSession()
      setIsAuthenticated(Boolean(session))
      setIsLoadingAuth(false)
    }

    void bootstrap()

    if (!supabase) return
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(Boolean(session))
      setIsLoadingAuth(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <Routes>
      <Route path="/" element={<AuditFormPage />} />
      <Route path="/dashboard/login" element={<DashboardLoginPage />} />
      <Route
        path="/dashboard"
        element={
          isLoadingAuth ? (
            <main className="page">Carregando autenticação...</main>
          ) : isAuthenticated ? (
            <DashboardPage />
          ) : (
            <Navigate to="/dashboard/login" replace />
          )
        }
      />
      <Route
        path="/dashboard/colaboradores"
        element={
          isLoadingAuth ? (
            <main className="page">Carregando autenticação...</main>
          ) : isAuthenticated ? (
            <ManageCollaboratorsPage />
          ) : (
            <Navigate to="/dashboard/login" replace />
          )
        }
      />
      <Route
        path="/dashboard/permissao-portal-bi"
        element={
          isLoadingAuth ? (
            <main className="page">Carregando autenticação...</main>
          ) : isAuthenticated ? (
            <PortalBiPermissionsPage />
          ) : (
            <Navigate to="/dashboard/login" replace />
          )
        }
      />
      <Route
        path="/dashboard/permissao-monitoramento-cameras"
        element={
          isLoadingAuth ? (
            <main className="page">Carregando autenticação...</main>
          ) : isAuthenticated ? (
            <CameraMonitoringPermissionsPage />
          ) : (
            <Navigate to="/dashboard/login" replace />
          )
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
