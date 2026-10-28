import { useEffect, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import './Header.css'

export default function Header({ onMenuToggle, sidebarOpen }) {
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

      <div className="header__user">
        <span className="header__avatar">
          {profile?.name?.[0]?.toUpperCase() || '?'}
        </span>
      </div>
    </header>
  )
}
