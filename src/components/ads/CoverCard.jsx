import { useState } from 'react'
import { driveThumb } from './AdCard'
import { MEDIA_LABELS } from '../../lib/catalog'
import './CoverCard.css'

// Capa compacta para carrosséis (estilo plataforma de cursos)
export default function CoverCard({ ad, seen, onClick, subtitle }) {
  const [broken, setBroken] = useState(false)
  const thumb = driveThumb(ad.drive_url, 600)
  const isVideo = ad.media_type === 'video'
  const initial = (ad.title || '?').trim().charAt(0).toUpperCase()

  return (
    <button type="button" className={`cover-card ${seen ? 'cover-card--seen' : ''}`} onClick={onClick}>
      <div className="cover-card__media">
        {thumb && !broken ? (
          <img src={thumb} alt="" loading="lazy" onError={() => setBroken(true)} />
        ) : (
          <div className="cover-card__fallback"><span>{initial}</span></div>
        )}
        <div className="cover-card__shade" />
        {ad.media_type && (
          <span className="cover-card__badge">{MEDIA_LABELS[ad.media_type] || ad.media_type}</span>
        )}
        {seen && (
          <span className="cover-card__seen" title="Visto">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </span>
        )}
        {isVideo && (
          <span className="cover-card__play" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          </span>
        )}
        <div className="cover-card__text">
          <strong>{ad.title}</strong>
          {subtitle && <span>{subtitle}</span>}
        </div>
      </div>
    </button>
  )
}
