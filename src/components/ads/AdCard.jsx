import DriveEmbed from './DriveEmbed'
import Tag from '../ui/Tag'
import { NICHE_LABELS, MEDIA_LABELS } from '../../lib/catalog'
import './AdCard.css'

export default function AdCard({ ad, isFavorite, onToggleFavorite, onOpen }) {
  const hasAnalysis = Boolean(ad.analysis && ad.analysis.trim())

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
        <h3 className="ad-card__title">{ad.title}</h3>

        {(ad.niches || []).length > 0 && (
          <div className="ad-card__tags">
            {ad.niches.map(n => (
              <Tag key={n}>{NICHE_LABELS[n] || n}</Tag>
            ))}
          </div>
        )}

        {hasAnalysis && (
          <p className="ad-card__excerpt">{ad.analysis}</p>
        )}

        <button type="button" className="ad-card__open" onClick={onOpen}>
          {hasAnalysis ? 'Ver análise completa' : 'Ver anúncio'}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </button>
      </div>
    </article>
  )
}
