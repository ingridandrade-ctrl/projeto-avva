import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import './Header.css'

// Faixa de cima: ocupa toda a largura, carrega a marca e, no celular, o
// botão do menu. O menu lateral fica logo abaixo dela.
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
        aria-expanded={sidebarOpen}
      >
        <span /><span /><span />
      </button>

      <Link to="/alunas" className="header__brand">
        <span className="header__logo">A</span>
        <span className="header__brand-text">
          <strong>Método AVVA</strong>
          <small>Área de Membros</small>
        </span>
      </Link>

      <Link to="/perfil" className="header__user" aria-label="Meu perfil">
        <span className="header__avatar">
          {profile?.name?.[0]?.toUpperCase() || '?'}
        </span>
      </Link>
    </header>
  )
}
