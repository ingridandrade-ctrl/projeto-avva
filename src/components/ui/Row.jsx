import { useRef } from 'react'
import { Link } from 'react-router-dom'
import './Row.css'

// Fileira horizontal com rolagem (estilo plataforma de cursos)
export default function Row({ title, subtitle, link, linkLabel = 'Ver tudo', children, size = 'md' }) {
  const ref = useRef(null)

  function scroll(dir) {
    const el = ref.current
    if (!el) return
    el.scrollBy({ left: dir * Math.max(el.clientWidth * 0.8, 240), behavior: 'smooth' })
  }

  return (
    <section className={`row row--${size}`}>
      <div className="row__head">
        <div>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
        <div className="row__controls">
          {link && <Link to={link} className="row__link">{linkLabel} →</Link>}
          <button type="button" className="row__arrow" onClick={() => scroll(-1)} aria-label="Anterior">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <button type="button" className="row__arrow" onClick={() => scroll(1)} aria-label="Próximo">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
      </div>
      <div className="row__track" ref={ref}>
        {children}
      </div>
    </section>
  )
}
