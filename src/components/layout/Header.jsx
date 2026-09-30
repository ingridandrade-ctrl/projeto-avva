import { useEffect, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import './Header.css'

export default function Header({ onMenuToggle, sidebarOpen, searchValue, onSearchChange }) {
  const { profile } = useAuth()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`header ${scrolled ? 'header--scrolled' : ''}`}>
      <button
        className={`header__menu-btn ${sidebarOpen ? 'header__menu-btn--active' : ''}`}
        onClick={onMenuToggle}
        aria-label="Menu"
      >
        <span /><span /><span />
      </button>

      <div className="header__search">
        <svg className="header__search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="text"
          placeholder="Buscar anuncios..."
          value={searchValue}
          onChange={e => onSearchChange(e.target.value)}
          className="header__search-input"
        />
      </div>

      <div className="header__user">
        <span className="header__avatar">
          {profile?.name?.[0]?.toUpperCase() || '?'}
        </span>
      </div>
    </header>
  )
}
