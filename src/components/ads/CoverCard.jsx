import PhoneCard from '../ui/PhoneCard'
import { driveThumb } from '../../lib/drive'
import { itemTypeLabel } from '../../lib/catalog'

// Capa de anúncio para carrosséis (formato celular 9:16)
export default function CoverCard({ ad, seen, onClick, subtitle, size }) {
  const initial = (ad.title || '?').trim().charAt(0).toUpperCase()
  return (
    <PhoneCard
      onClick={onClick}
      image={driveThumb(ad.drive_url, 1000)}
      title={ad.title}
      kicker={subtitle}
      badge={itemTypeLabel(ad)}
      play={ad.media_type === 'video'}
      seen={seen}
      fallbackLabel={initial}
      className={size === 'sm' ? 'phone-card--sm' : ''}
    />
  )
}
