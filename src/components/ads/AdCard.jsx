import { useState } from 'react'
import DriveEmbed from './DriveEmbed'
import Tag from '../ui/Tag'
import './AdCard.css'

const MOMENT_LABELS = { topo: 'Topo', meio: 'Meio', fundo: 'Fundo' }

export default function AdCard({ ad, isFavorite, onToggleFavorite }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <article className="ad-card">
      <DriveEmbed url={ad.drive_url} title={ad.title} />

      <div className="ad-card__body">
        <div className="ad-card__header">
          <h3 className="ad-card__title">{ad.title}</h3>
          <button
            className={`ad-card__fav ${isFavorite ? 'ad-card__fav--active' : ''}`}
            onClick={() => onToggleFavorite(ad.id)}
            aria-label={isFavorite ? 'Remover dos favoritos' : 'Favoritar'}
          >
            {isFavorite ? '♥' : '♡'}
          </button>
        </div>

        <div className="ad-card__tags">
          {ad.moment && <Tag type={ad.moment}>{MOMENT_LABELS[ad.moment]}</Tag>}
          {ad.format && <Tag>{ad.format}</Tag>}
          {ad.subniche && <Tag>{ad.subniche}</Tag>}
        </div>

        {ad.analysis && (
          <div className="ad-card__analysis">
            <button
              className="ad-card__toggle"
              onClick={() => setExpanded(e => !e)}
            >
              {expanded ? 'Ocultar análise' : 'Ver análise'}
              <span className={`ad-card__chevron ${expanded ? 'ad-card__chevron--up' : ''}`}>›</span>
            </button>
            {expanded && (
              <div className="ad-card__analysis-text">
                {ad.analysis}
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  )
}
