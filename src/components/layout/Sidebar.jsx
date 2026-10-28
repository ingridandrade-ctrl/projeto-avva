import { NavLink } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import './Sidebar.css'

const WHATS_URL = 'https://wa.me/5519920002917'

const I = {
  home: <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>,
  grid: <><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/></>,
  heart: <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>,
  kit: <><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></>,
  user: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
  chat: <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>,
}

function Item({ to, icon, children, end, onClick }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`}
      onClick={onClick}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{I[icon]}</svg>
      <span>{children}</span>
    </NavLink>
  )
}

// Menu lateral: fica abaixo da faixa de cima. No celular só aparece pelo
// botão do menu.
export default function Sidebar({ open, onClose }) {
  const { profile, signOut } = useAuth()
  const hasKit = Boolean(profile?.has_order_bump)

  return (
    <>
      {open && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={`sidebar ${open ? 'sidebar--open' : ''}`}>
        <nav className="sidebar__nav">
          <Item to="/alunas" icon="home" end onClick={onClose}>Início</Item>
          <Item to="/produto/acervo-anuncios" icon="grid" onClick={onClose}>Acervo de Anúncios</Item>
          <Item to="/favoritos" icon="heart" onClick={onClose}>Favoritos</Item>
          {hasKit && <Item to="/kit" icon="kit" onClick={onClose}>Kit de Execução</Item>}
          <Item to="/perfil" icon="user" onClick={onClose}>Meu Perfil</Item>
        </nav>

        <div className="sidebar__footer">
          <a className="sidebar__link sidebar__link--support" href={WHATS_URL} target="_blank" rel="noreferrer">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{I.chat}</svg>
            <span>Falar com o suporte</span>
          </a>

          {profile?.is_admin && (
            <NavLink to="/admin" className="sidebar__admin-link" onClick={onClose}>
              Painel Admin
            </NavLink>
          )}

          <div className="sidebar__user-info">
            <div className="sidebar__user-avatar">
              {profile?.name?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="sidebar__user-details">
              <span className="sidebar__user-name">{profile?.name || 'Aluna'}</span>
              <span className="sidebar__user-email">{profile?.email}</span>
            </div>
          </div>
          <button className="sidebar__signout" onClick={signOut}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Sair
          </button>
        </div>
      </aside>
    </>
  )
}
