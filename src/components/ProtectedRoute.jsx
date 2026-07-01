import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function ProtectedRoute({ children }) {
  const { session, loading } = useAuth()

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

  if (!session) return <Navigate to="/login" replace />
  return children
}
