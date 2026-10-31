import { useState } from 'react'
import { Link } from 'react-router-dom'
import './PhoneCard.css'

// Card vertical 9:16 (formato de tela de celular) com imagem de capa e
// título sobre a imagem. Usado para anúncios, coleções e produtos.
export default function PhoneCard({
  to,
  onClick,
  image,
  imageAlt,
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
  eager = false,
  className = '',
  style,
}) {
  // Capa: tenta a principal; se falhar e houver reserva, tenta a reserva; senão cai na letra.
  // O estado guarda para qual imagem vale, assim um card reaproveitado com outra capa recomeça.
  const [tentativa, setTentativa] = useState({ para: image, n: 0 })
  const n = tentativa.para === image ? tentativa.n : 0
  const src = n === 0 ? image : n === 1 ? imageAlt : null
  const showImage = Boolean(src)
  function onImgError() {
    setTentativa({ para: image, n: n === 0 && imageAlt ? 1 : 2 })
  }

  const inner = (
    <div className="phone-card__media">
      {showImage ? (
        <img src={src} alt="" loading={eager ? 'eager' : 'lazy'} fetchPriority={eager ? 'high' : undefined} decoding="async" onError={onImgError} />
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
      {(kicker || meta) && (
        <span className="phone-card__caption-row">
          {kicker && <span className="phone-card__caption-kicker">{kicker}</span>}
          {meta && <span className="phone-card__caption-meta">{meta}</span>}
        </span>
      )}
      <strong className="phone-card__caption-title">{title}</strong>
      {subtitle && <span className="phone-card__caption-subtitle">{subtitle}</span>}
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
