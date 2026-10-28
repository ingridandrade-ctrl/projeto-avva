import { useState } from 'react'
import { Link } from 'react-router-dom'
import './PhoneCard.css'

// Card vertical 9:16 (formato de tela de celular) com imagem de capa e
// título sobre a imagem. Usado para anúncios, coleções e produtos.
export default function PhoneCard({
  to,
  onClick,
  image,
  title,
  subtitle,
  kicker,
  meta,
  badge,
  locked = false,
  lockedLabel = 'Faça upgrade para acessar',
  seen = false,
  play = false,
  overlay = null,
  fallbackGradient,
  fallbackLabel,
  textBelow = false,
  className = '',
  style,
}) {
  const [broken, setBroken] = useState(false)
  const showImage = Boolean(image) && !broken

  const inner = (
    <div className="phone-card__media">
      {showImage ? (
        <img src={image} alt="" loading="lazy" onError={() => setBroken(true)} />
      ) : (
        <div className="phone-card__fallback" style={{ background: fallbackGradient }}>
          {fallbackLabel && <span>{fallbackLabel}</span>}
        </div>
      )}
      {!textBelow && <div className="phone-card__shade" />}

      {badge && <span className="phone-card__badge">{badge}</span>}
      {overlay}

      {play && !locked && (
        <span className="phone-card__play" aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
        </span>
      )}

      {seen && (
        <span className="phone-card__seen" title="Visto">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </span>
      )}

      {locked && (
        <span className="phone-card__lock">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          <small>{lockedLabel}</small>
        </span>
      )}

      {!textBelow && (
        <div className="phone-card__text">
          {kicker && <span className="phone-card__kicker">{kicker}</span>}
          <strong className="phone-card__title">{title}</strong>
          {subtitle && <span className="phone-card__subtitle">{subtitle}</span>}
          {meta && <span className="phone-card__meta">{meta}</span>}
          <i className="phone-card__bar" aria-hidden="true" />
        </div>
      )}
    </div>
  )

  // Texto embaixo da imagem: a capa fica inteira, sem nada por cima
  const caption = textBelow && (
    <div className="phone-card__caption">
      {kicker && <span className="phone-card__caption-kicker">{kicker}</span>}
      <strong className="phone-card__caption-title">{title}</strong>
      {subtitle && <span className="phone-card__caption-subtitle">{subtitle}</span>}
      {meta && <span className="phone-card__caption-meta">{meta}</span>}
    </div>
  )

  const cls = [
    'phone-card',
    seen && 'phone-card--seen',
    locked && 'phone-card--locked',
    textBelow && 'phone-card--captioned',
    className,
  ].filter(Boolean).join(' ')

  if (to && !locked) {
    return <Link to={to} className={cls} style={style}>{inner}{caption}</Link>
  }
  if (onClick && !locked) {
    return (
      <div
        className={cls}
        style={style}
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(e) } }}
      >
        {inner}{caption}
      </div>
    )
  }
  return <div className={cls} style={style}>{inner}{caption}</div>
}
