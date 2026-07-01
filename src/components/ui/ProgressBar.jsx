import './ProgressBar.css'

export default function ProgressBar({ value = 0, label }) {
  const pct = Math.min(100, Math.max(0, Math.round(value)))
  return (
    <div className="progress-bar">
      {label && <span className="progress-bar__label">{label}</span>}
      <div className="progress-bar__track">
        <div className="progress-bar__fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="progress-bar__pct">{pct}%</span>
    </div>
  )
}
