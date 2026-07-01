import './Tag.css'

const COLOR_MAP = {
  topo: 'tag--teal',
  meio: 'tag--terracotta',
  fundo: 'tag--umber',
}

export default function Tag({ children, type, onClick, active }) {
  const colorClass = COLOR_MAP[type] || 'tag--default'
  return (
    <span
      className={`tag ${colorClass} ${active ? 'tag--active' : ''} ${onClick ? 'tag--clickable' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </span>
  )
}
