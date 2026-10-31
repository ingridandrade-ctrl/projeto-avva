import PhoneCard from '../ui/PhoneCard'
import { driveThumb, driveThumbAlt } from '../../lib/drive'
import { MEDIA_LABELS } from '../../lib/catalog'

// Capa de anúncio para carrosséis (formato celular 9:16)
export default function CoverCard({ ad, seen, onClick, subtitle, size }) {
  const initial = (ad.title || '?').trim().charAt(0).toUpperCase()
  return (
    <PhoneCard
      onClick={onClick}
      image={driveThumbAlt(ad.drive_url, 640)}
      imageAlt={driveThumb(ad.drive_url, 640)}
      title={ad.title}
      kicker={subtitle}
      badge={ad.media_type ? (MEDIA_LABELS[ad.media_type] || ad.media_type) : null}
      play={ad.media_type === 'video'}
      seen={seen}
      fallbackLabel={initial}
      className={size === 'sm' ? 'phone-card--sm' : ''}
    />
  )
}
