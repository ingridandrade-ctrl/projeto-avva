import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import './AdminLayout.css'

const NAV = [
  { to: '/admin', label: 'Painel', end: true },
  { to: '/admin/ads', label: 'Anúncios' },
  { to: '/admin/kit', label: 'Kit de Execução' },
]

export default function AdminLayout() {
  const { signOut } = useAuth()

  return (
    <div className="admin-layout">
      <header className="admin-header">
        <div className="admin-header__brand">
          <h1>Admin</h1>
          <span>Acervo de Anúncios</span>
        </div>
        <nav className="admin-header__nav">
          {NAV.map((item, index) => (
            <>
              {index > 0 && (
                <span key={`sep-${index}`} className="admin-header__sep" />
              )}
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `admin-header__link ${isActive ? 'admin-header__link--active' : ''}`
                }
              >
                {item.label}
              </NavLink>
            </>
          ))}
        </nav>
        <div className="admin-header__actions">
          <NavLink to="/dashboard" className="admin-header__link">
            ← Voltar ao site
          </NavLink>
          <button className="admin-header__signout" onClick={signOut}>Sair</button>
        </div>
      </header>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  )
}
