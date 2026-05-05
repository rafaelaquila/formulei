import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  getDashboardSession,
  loginDashboard,
} from '@/features/dashboard/auth/dashboard-session'
import { useToast } from '@/shared/hooks/useToast'
import { AppFooter } from '@/shared/ui/Footer'
import { Toast } from '@/shared/ui/Toast'
import { Button, Card, Field } from '@/shared/ui/ui'

export function DashboardLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast, showToast } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    async function checkSession() {
      const session = await getDashboardSession()
      if (session) {
        navigate('/dashboard', { replace: true })
      }
    }

    void checkSession()
  }, [navigate])

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    if (!email.trim()) {
      showToast('Informe o email para continuar.', 'error')
      setLoading(false)
      return
    }

    if (!password.trim()) {
      showToast('Informe a senha para continuar.', 'error')
      setLoading(false)
      return
    }

    try {
      await loginDashboard(email, password)
      showToast('Login realizado com sucesso.', 'success')
      navigate('/dashboard', { replace: true })
    } catch {
      setError('Credenciais inválidas ou usuário não cadastrado.')
      showToast('Credenciais inválidas ou usuário não cadastrado.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="page">
      <header className="page-header">
        <div>
          <p className="badge">Formulei</p>
          <h1 className="page-title">Login do Dashboard</h1>
          <p className="subtitle">Acesso restrito para visualização de indicadores.</p>
        </div>
        <Link className="btn btn-secondary" to="/">
          Voltar ao formulário
        </Link>
      </header>

      <Card title="Autenticação">
        <form className="stack" onSubmit={onSubmit} noValidate>
          <Field label="Email" htmlFor="dashboard-user">
            <input
              id="dashboard-user"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </Field>
          <Field label="Senha" htmlFor="dashboard-password">
            <input
              id="dashboard-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </Field>
          {error ? <p className="error-text">{error}</p> : null}
          <div className="actions">
            <Button type="submit" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </div>
        </form>
      </Card>
      {toast ? <Toast message={toast.message} type={toast.type} /> : null}
      <AppFooter />
    </main>
  )
}
