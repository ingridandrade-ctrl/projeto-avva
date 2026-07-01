import { NavLink } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import './Sidebar.css'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Inicio', status: 'complete' },
  { to: '/modulos/boas-vindas', label: 'Boas-vindas', status: 'not-started' },
  { to: '/modulos/o-basico', label: 'O basico', status: 'not-started' },
  { to: '/modulos/negocio-local', label: 'Negocio local', status: 'not-started' },
  { to: '/modulos/infoproduto', label: 'Infoproduto', status: 'not-started' },
  { to: '/modulos/servico', label: 'Servico', status: 'not-started' },
  { to: '/modulos/ecommerce', label: 'E-commerce', status: 'not-started' },
  { to: '/modulos/bonus-datas', label: 'Datas especiais', status: 'not-started' },
]

const ORDER_BUMP_ITEM = { to: '/kit', label: 'Kit de Execucao', status: 'not-started' }

export default function Sidebar({ open, onClose }) {
  const { profile, signOut } = useAuth()

  return (
    <>
      {open && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={`sidebar ${open ? 'sidebar--open' : ''}`}>
        <div className="sidebar__brand">
          <h2>Método AVVA</h2>
          <span className="sidebar__subtitle">Área de Membros</span>
          <span className="sidebar__brand-line" />
        </div>

        <nav className="sidebar__nav">
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
              }
              onClick={onClose}
            >
              {item.label}
              <span className={`sidebar__status-dot sidebar__status-dot--${item.status}`} />
            </NavLink>
          ))}

          {profile?.has_order_bump && (
            <NavLink
              to={ORDER_BUMP_ITEM.to}
              className={({ isActive }) =>
                `sidebar__link sidebar__link--bump ${isActive ? 'sidebar__link--active' : ''}`
              }
              onClick={onClose}
            >
              {ORDER_BUMP_ITEM.label}
              <span className={`sidebar__status-dot sidebar__status-dot--${ORDER_BUMP_ITEM.status}`} />
            </NavLink>
          )}
        </nav>

        <div className="sidebar__footer">
          {profile?.is_admin && (
            <NavLink
              to="/admin"
              className="sidebar__admin-link"
              onClick={onClose}
            >
              Painel Admin
            </NavLink>
          )}
          <button className="sidebar__signout" onClick={signOut}>
            Sair
          </button>
        </div>
      </aside>
    </>
  )
}
