import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function AdminRoute({ children, loginPath = '/login', deniedPath = '/dashboard' }) {
  const { session, profile, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        color: 'var(--teal-medio)',
        fontFamily: 'var(--font-titulo)',
        fontSize: '1.2rem',
      }}>
        Carregando...
      </div>
    )
  }

  if (!session) return <Navigate to={loginPath} replace state={{ from: location.pathname }} />
  if (!profile?.is_admin) return <Navigate to={deniedPath} replace />
  return children
}
