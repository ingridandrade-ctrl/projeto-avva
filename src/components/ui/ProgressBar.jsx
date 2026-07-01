import { useState, useEffect, useRef } from 'react'
import './ProgressBar.css'

export default function ProgressBar({ value = 0, label }) {
  const pct = Math.min(100, Math.max(0, Math.round(value)))
  const [displayPct, setDisplayPct] = useState(0)
  const rafRef = useRef(null)

  useEffect(() => {
    const start = performance.now()
    const duration = 600
    const from = 0
    const to = pct

    function tick(now) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayPct(Math.round(from + (to - from) * eased))
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick)
      }
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [pct])

  const isComplete = pct >= 100

  return (
    <div className="progress-bar">
      {label && <span className="progress-bar__label">{label}</span>}
      <div className="progress-bar__track">
        <div
          className={`progress-bar__fill${isComplete ? ' progress-bar__fill--complete' : ''}`}
          style={{ '--target-width': `${pct}%` }}
        />
      </div>
      <span className="progress-bar__pct">{displayPct}%</span>
    </div>
  )
}
