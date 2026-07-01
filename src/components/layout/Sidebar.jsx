import { NavLink } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import './Sidebar.css'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Início', icon: '◈' },
  { to: '/modulos/boas-vindas', label: 'Boas-vindas', icon: '○' },
  { to: '/modulos/o-basico', label: 'O básico', icon: '○' },
  { to: '/modulos/negocio-local', label: 'Negócio local', icon: '○' },
  { to: '/modulos/infoproduto', label: 'Infoproduto', icon: '○' },
  { to: '/modulos/servico', label: 'Serviço', icon: '○' },
  { to: '/modulos/ecommerce', label: 'E-commerce', icon: '○' },
  { to: '/modulos/bonus-datas', label: 'Datas especiais', icon: '★' },
]

const ORDER_BUMP_ITEM = { to: '/kit', label: 'Kit de Execução', icon: '◆' }

export default function Sidebar({ open, onClose }) {
  const { profile, signOut } = useAuth()

  return (
    <>
      {open && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={`sidebar ${open ? 'sidebar--open' : ''}`}>
        <div className="sidebar__brand">
          <h2>Acervo de Criativos</h2>
          <span className="sidebar__subtitle">Pronta pro Digital</span>
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
              <span className="sidebar__icon">{item.icon}</span>
              {item.label}
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
              <span className="sidebar__icon">{ORDER_BUMP_ITEM.icon}</span>
              {ORDER_BUMP_ITEM.label}
            </NavLink>
          )}
        </nav>

        <div className="sidebar__footer">
          <button className="sidebar__signout" onClick={signOut}>
            Sair
          </button>
        </div>
      </aside>
    </>
  )
}
