import './Skeleton.css'

const variantDefaults = {
  text: { width: '100%', height: '1em', borderRadius: 'var(--radius-sm, 6px)' },
  circle: { width: 40, height: 40, borderRadius: '50%' },
  rect: { width: '100%', height: 100, borderRadius: 'var(--radius-md, 10px)' },
  card: { width: '100%', height: 200, borderRadius: 'var(--radius-lg, 16px)' },
}

export function Skeleton({
  width,
  height,
  borderRadius,
  variant = 'rect',
  className = '',
  style = {},
}) {
  const defaults = variantDefaults[variant] || variantDefaults.rect
  const w = width ?? defaults.width
  const h = height ?? defaults.height
  const br = borderRadius ?? defaults.borderRadius

  return (
    <div
      className={`skeleton ${className}`}
      style={{
        width: typeof w === 'number' ? `${w}px` : w,
        height: typeof h === 'number' ? `${h}px` : h,
        borderRadius: typeof br === 'number' ? `${br}px` : br,
        ...style,
      }}
    />
  )
}

export function SkeletonCard({ className = '' }) {
  return (
    <div className={`skeleton-card ${className}`}>
      <Skeleton variant="rect" height={180} borderRadius="var(--radius-md, 10px)" />
      <div className="skeleton-card__body">
        <Skeleton variant="text" width="75%" height={16} />
        <Skeleton variant="text" width="50%" height={14} />
        <div className="skeleton-card__tags">
          <Skeleton variant="text" width={60} height={22} borderRadius={12} />
          <Skeleton variant="text" width={48} height={22} borderRadius={12} />
          <Skeleton variant="text" width={56} height={22} borderRadius={12} />
        </div>
      </div>
    </div>
  )
}

export function SkeletonModuleCard({ className = '' }) {
  return (
    <div className={`skeleton-module ${className}`}>
      <Skeleton variant="circle" width={44} height={44} />
      <div className="skeleton-module__content">
        <Skeleton variant="text" width="65%" height={16} />
        <Skeleton variant="text" width="40%" height={13} />
        <Skeleton variant="rect" width="100%" height={6} borderRadius={3} />
      </div>
    </div>
  )
}
