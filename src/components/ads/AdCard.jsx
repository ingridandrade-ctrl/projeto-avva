import { useState } from 'react'
import Tag from '../ui/Tag'
import { NICHE_LABELS, MEDIA_LABELS } from '../../lib/catalog'
import './AdCard.css'

function driveId(url) {
  const m = (url || '').match(/\/d\/([a-zA-Z0-9_-]+)/) || (url || '').match(/[?&]id=([a-zA-Z0-9_-]+)/)
  return m ? m[1] : null
}

// Capa gerada pelo próprio Drive (frame do vídeo, a imagem ou a 1ª página do PDF)
export function driveThumb(url, width = 900) {
  const id = driveId(url)
  return id ? `https://drive.google.com/thumbnail?id=${id}&sz=w${width}` : null
}

export default function AdCard({ ad, isFavorite, onToggleFavorite, onOpen }) {
  const [broken, setBroken] = useState(false)
  const thumb = driveThumb(ad.drive_url)
  const hasAnalysis = Boolean(ad.analysis && ad.analysis.trim())
  const isVideo = ad.media_type === 'video'
  const initial = (ad.title || '?').trim().charAt(0).toUpperCase()

  return (
    <article className="ad-card" onClick={onOpen} role="button" tabIndex={0}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen() } }}>
      <div className="ad-card__cover">
        {thumb && !broken ? (
          <img
            src={thumb}
            alt=""
            loading="lazy"
            onError={() => setBroken(true)}
          />
        ) : (
          <div className="ad-card__cover-fallback"><span>{initial}</span></div>
        )}
        <div className="ad-card__cover-shade" />

        {ad.media_type && (
          <span className="ad-card__format-badge">{MEDIA_LABELS[ad.media_type] || ad.media_type}</span>
        )}

        <button
          className={`ad-card__fav ${isFavorite ? 'ad-card__fav--active' : ''}`}
          onClick={e => { e.stopPropagation(); onToggleFavorite(ad.id) }}
          aria-label={isFavorite ? 'Remover dos favoritos' : 'Favoritar'}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>

        {isVideo && (
          <span className="ad-card__play" aria-hidden="true">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          </span>
        )}

        <h3 className="ad-card__title">{ad.title}</h3>
      </div>

      <div className="ad-card__body">
        {(ad.niches || []).length > 0 && (
          <div className="ad-card__tags">
            {ad.niches.map(n => (
              <Tag key={n}>{NICHE_LABELS[n] || n}</Tag>
            ))}
          </div>
        )}

        {hasAnalysis ? (
          <p className="ad-card__excerpt">{ad.analysis}</p>
        ) : (
          <p className="ad-card__excerpt ad-card__excerpt--muted">Análise em breve.</p>
        )}

        <span className="ad-card__open">
          {hasAnalysis ? 'Ver análise completa' : 'Ver anúncio'}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </span>
      </div>
    </article>
  )
}
