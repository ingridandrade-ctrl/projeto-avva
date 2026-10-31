import PhoneCard from '../ui/PhoneCard'
import { driveThumb, driveThumbAlt } from '../../lib/drive'
import { NICHE_LABELS, MEDIA_LABELS } from '../../lib/catalog'
import './AdCard.css'

export { driveThumb }

// Card de anúncio nas grades (coleção, busca): capa 3:4 inteira em cima;
// na base branca, nicho à esquerda, tipo de mídia + favorito à direita, e o título.
export default function AdCard({ ad, isFavorite, onToggleFavorite, onOpen, seen = false, eager = false }) {
  const initial = (ad.title || '?').trim().charAt(0).toUpperCase()
  const nicheList = (ad.niches || []).map(n => NICHE_LABELS[n] || n)
  // No celular só cabe o primeiro nicho; os outros ficam escondidos por CSS
  const niches = nicheList.length
    ? <>{nicheList[0]}{nicheList.length > 1 && <span className="ad-card__more"> · {nicheList.slice(1).join(' · ')}</span>}</>
    : null
  const media = ad.media_type ? (MEDIA_LABELS[ad.media_type] || ad.media_type) : null

  const side = (
    <span className="ad-card__side">
      {media && <span className="ad-card__type">{media}</span>}
      <button
        type="button"
        className={`ad-card__fav ${isFavorite ? 'ad-card__fav--active' : ''}`}
        onClick={e => { e.stopPropagation(); onToggleFavorite(ad.id) }}
        aria-label={isFavorite ? 'Remover dos favoritos' : 'Favoritar'}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
      </button>
    </span>
  )

  return (
    <PhoneCard
      onClick={onOpen}
      image={driveThumbAlt(ad.drive_url, 640)}
      imageAlt={driveThumb(ad.drive_url, 640)}
      eager={eager}
      title={ad.title}
      kicker={niches || '\u00a0'}
      meta={side}
      play={ad.media_type === 'video'}
      seen={seen}
      fallbackLabel={initial}
      textBelow
      className={`ad-card ${seen ? 'ad-card--seen' : ''}`}
    />
  )
}
