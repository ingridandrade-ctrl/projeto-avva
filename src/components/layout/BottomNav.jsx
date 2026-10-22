import { NavLink } from 'react-router-dom'
import './BottomNav.css'

const I = {
  home: <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>,
  grid: <><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/></>,
  heart: <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>,
  user: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
}

const ITEMS = [
  { to: '/alunas', label: 'Início', icon: 'home', end: true },
  { to: '/produto/acervo-anuncios', label: 'Coleções', icon: 'grid' },
  { to: '/favoritos', label: 'Favoritos', icon: 'heart' },
  { to: '/perfil', label: 'Perfil', icon: 'user' },
]

// Barra inferior (só no celular), como nas plataformas de membros
export default function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Navegação">
      {ITEMS.map(item => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) => `bottom-nav__item ${isActive ? 'bottom-nav__item--active' : ''}`}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">{I[item.icon]}</svg>
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
