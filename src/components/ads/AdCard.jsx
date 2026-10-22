import PhoneCard from '../ui/PhoneCard'
import { driveThumb } from '../../lib/drive'
import { NICHE_LABELS, MEDIA_LABELS } from '../../lib/catalog'
import './AdCard.css'

export { driveThumb }

// Card de anúncio nas grades (coleção, busca): formato celular 9:16,
// capa do Drive, favorito, selo "visto" e nichos como meta.
export default function AdCard({ ad, isFavorite, onToggleFavorite, onOpen, seen = false }) {
  const initial = (ad.title || '?').trim().charAt(0).toUpperCase()
  const niches = (ad.niches || []).map(n => NICHE_LABELS[n] || n).join(' · ')

  const fav = (
    <button
      type="button"
      className={`ad-card__fav ${isFavorite ? 'ad-card__fav--active' : ''}`}
      onClick={e => { e.stopPropagation(); onToggleFavorite(ad.id) }}
      aria-label={isFavorite ? 'Remover dos favoritos' : 'Favoritar'}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    </button>
  )

  return (
    <PhoneCard
      onClick={onOpen}
      image={driveThumb(ad.drive_url, 700)}
      title={ad.title}
      meta={niches || undefined}
      badge={ad.media_type ? (MEDIA_LABELS[ad.media_type] || ad.media_type) : null}
      play={ad.media_type === 'video'}
      seen={seen}
      overlay={fav}
      fallbackLabel={initial}
      className={`ad-card ${seen ? 'ad-card--seen' : ''}`}
    />
  )
}
