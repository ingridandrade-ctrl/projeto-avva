import Tag from '../ui/Tag'
import './FilterBar.css'

const MOMENTS = ['topo', 'meio', 'fundo']
const MOMENT_LABELS = { topo: 'Topo de funil', meio: 'Meio de funil', fundo: 'Fundo de funil' }

export default function FilterBar({
  moments = MOMENTS,
  formats = [],
  subniches = [],
  selectedMoment,
  selectedFormat,
  selectedSubniche,
  onMomentChange,
  onFormatChange,
  onSubnicheChange,
}) {
  return (
    <div className="filter-bar">
      <div className="filter-bar__group">
        <span className="filter-bar__label">Momento:</span>
        <div className="filter-bar__tags">
          <Tag onClick={() => onMomentChange(null)} active={!selectedMoment}>Todos</Tag>
          {moments.map(m => (
            <Tag key={m} type={m} onClick={() => onMomentChange(selectedMoment === m ? null : m)} active={selectedMoment === m}>
              {MOMENT_LABELS[m] || m}
            </Tag>
          ))}
        </div>
      </div>

      {formats.length > 0 && (
        <div className="filter-bar__group">
          <span className="filter-bar__label">Formato:</span>
          <div className="filter-bar__tags">
            <Tag onClick={() => onFormatChange(null)} active={!selectedFormat}>Todos</Tag>
            {formats.map(f => (
              <Tag key={f} onClick={() => onFormatChange(selectedFormat === f ? null : f)} active={selectedFormat === f}>{f}</Tag>
            ))}
          </div>
        </div>
      )}

      {subniches.length > 0 && (
        <div className="filter-bar__group">
          <span className="filter-bar__label">Sub-nicho:</span>
          <div className="filter-bar__tags">
            <Tag onClick={() => onSubnicheChange(null)} active={!selectedSubniche}>Todos</Tag>
            {subniches.map(s => (
              <Tag key={s} onClick={() => onSubnicheChange(selectedSubniche === s ? null : s)} active={selectedSubniche === s}>{s}</Tag>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
