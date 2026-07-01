import { useState } from 'react'
import DriveEmbed from './DriveEmbed'
import Tag from '../ui/Tag'
import { NICHE_LABELS, MEDIA_LABELS } from '../../lib/catalog'
import './AdCard.css'

export default function AdCard({ ad, isFavorite, onToggleFavorite }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <article className="ad-card">
      <div className="ad-card__embed-wrap">
        <DriveEmbed url={ad.drive_url} title={ad.title} />
        {ad.media_type && (
          <span className="ad-card__format-badge">{MEDIA_LABELS[ad.media_type] || ad.media_type}</span>
        )}
        <button
          className={`ad-card__fav ${isFavorite ? 'ad-card__fav--active' : ''}`}
          onClick={() => onToggleFavorite(ad.id)}
          aria-label={isFavorite ? 'Remover dos favoritos' : 'Favoritar'}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
      </div>

      <div className="ad-card__body">
        <div className="ad-card__header">
          <h3 className="ad-card__title">{ad.title}</h3>
        </div>

        {(ad.niches || []).length > 0 && (
          <div className="ad-card__tags">
            {ad.niches.map(n => (
              <Tag key={n}>{NICHE_LABELS[n] || n}</Tag>
            ))}
          </div>
        )}

        {ad.analysis && (
          <div className="ad-card__analysis">
            <button
              className="ad-card__toggle"
              onClick={() => setExpanded(e => !e)}
            >
              {expanded ? 'Ocultar análise' : 'Ver análise'}
              <span className={`ad-card__chevron ${expanded ? 'ad-card__chevron--up' : ''}`}>›</span>
            </button>
            <div className={`ad-card__analysis-text ${expanded ? 'ad-card__analysis-text--visible' : ''}`}>
              {ad.analysis}
            </div>
          </div>
        )}
      </div>
    </article>
  )
}
