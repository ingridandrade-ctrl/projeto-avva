import Tag from '../ui/Tag'
import { NICHES, MEDIA_TYPES } from '../../lib/catalog'
import './FilterBar.css'

export default function FilterBar({
  selectedNiche,
  selectedMedia,
  onNicheChange,
  onMediaChange,
}) {
  return (
    <div className="filter-bar">
      {(selectedNiche || selectedMedia) && (
        <button
          type="button"
          className="filter-bar__clear"
          onClick={() => { onNicheChange(null); onMediaChange(null) }}
        >
          Limpar filtros
        </button>
      )}
      <div className="filter-bar__group">
        <span className="filter-bar__label">Nicho:</span>
        <div className="filter-bar__tags">
          <Tag onClick={() => onNicheChange(null)} active={!selectedNiche}>Todos</Tag>
          {NICHES.map(n => (
            <Tag
              key={n.value}
              onClick={() => onNicheChange(selectedNiche === n.value ? null : n.value)}
              active={selectedNiche === n.value}
            >
              {n.label}
            </Tag>
          ))}
        </div>
      </div>

      <div className="filter-bar__group">
        <span className="filter-bar__label">Mídia:</span>
        <div className="filter-bar__tags">
          <Tag onClick={() => onMediaChange(null)} active={!selectedMedia}>Todas</Tag>
          {MEDIA_TYPES.map(m => (
            <Tag
              key={m.value}
              onClick={() => onMediaChange(selectedMedia === m.value ? null : m.value)}
              active={selectedMedia === m.value}
            >
              {m.label}
            </Tag>
          ))}
        </div>
      </div>
    </div>
  )
}
