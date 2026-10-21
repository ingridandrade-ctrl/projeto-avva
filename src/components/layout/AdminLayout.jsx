import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import './AdminLayout.css'

// "Produtos" fica ativo em qualquer tela de produto (anúncios, kit)
const NAV = [
  { to: '/admin', label: 'Painel', match: p => p === '/admin' },
  { to: '/admin/produtos', label: 'Produtos', match: p => p.startsWith('/admin/produtos') || p.startsWith('/admin/ads') || p.startsWith('/admin/kit') },
  { to: '/admin/mentoria', label: 'Mentoria', match: p => p.startsWith('/admin/mentoria') },
]

export default function AdminLayout() {
  const { signOut } = useAuth()
  const { pathname } = useLocation()

  return (
    <div className="admin-layout">
      <header className="admin-header">
        <div className="admin-header__brand">
          <h1>Admin</h1>
          <span>Método AVVA</span>
        </div>
        <nav className="admin-header__nav">
          {NAV.map((item, index) => (
            <span key={item.to} style={{ display: 'contents' }}>
              {index > 0 && <span className="admin-header__sep" />}
              <NavLink
                to={item.to}
                className={`admin-header__link ${item.match(pathname) ? 'admin-header__link--active' : ''}`}
              >
                {item.label}
              </NavLink>
            </span>
          ))}
        </nav>
        <div className="admin-header__actions">
          <NavLink to="/alunas" className="admin-header__link">
            ← Área das alunas
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
