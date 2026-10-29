import Tag from '../ui/Tag'
import { NICHES, MEDIA_TYPES } from '../../lib/catalog'
import './FilterBar.css'

export default function FilterBar({
  search = '',
  onSearchChange,
  selectedNiche,
  selectedMedia,
  onNicheChange,
  onMediaChange,
  total,
  shown,
}) {
  const hasFilter = selectedNiche || selectedMedia || search

  function clear() {
    onNicheChange(null)
    onMediaChange(null)
    onSearchChange?.('')
  }

  return (
    <div className="filter-bar">
      <div className="filter-bar__top">
        {onSearchChange && (
          <label className="filter-bar__search">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              type="search"
              value={search}
              onChange={e => onSearchChange(e.target.value)}
              placeholder="Buscar nesta coleção…"
            />
          </label>
        )}
        <div className="filter-bar__meta">
          {typeof shown === 'number' && (
            <span className="filter-bar__count">
              {hasFilter ? `${shown} de ${total}` : `${total}`} {total === 1 ? 'anúncio' : 'anúncios'}
            </span>
          )}
          {hasFilter && (
            <button type="button" className="filter-bar__clear" onClick={clear}>
              Limpar filtros
            </button>
          )}
        </div>
      </div>

      {/* Celular: seletores nativos, mais fáceis de usar com o dedo */}
      <div className="filter-bar__selects">
        <label>
          <span>Nicho</span>
          <select value={selectedNiche || ''} onChange={e => onNicheChange(e.target.value || null)}>
            <option value="">Todos</option>
            {NICHES.map(n => <option key={n.value} value={n.value}>{n.label}</option>)}
          </select>
        </label>
        <label>
          <span>Mídia</span>
          <select value={selectedMedia || ''} onChange={e => onMediaChange(e.target.value || null)}>
            <option value="">Todas</option>
            {MEDIA_TYPES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
        </label>
      </div>

      <div className="filter-bar__groups">
        <div className="filter-bar__group">
          <span className="filter-bar__label">Para qual nicho?</span>
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
          <span className="filter-bar__label">Tipo de mídia</span>
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
    </div>
  )
}
