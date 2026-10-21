import { useEffect, useState } from 'react'
import { getRecent, getSeen, onActivityChange, pushRecent, toggleSeen } from '../lib/activity'

export function useActivity() {
  const [recent, setRecent] = useState(getRecent)
  const [seen, setSeen] = useState(getSeen)

  useEffect(() => {
    return onActivityChange(() => {
      setRecent(getRecent())
      setSeen(getSeen())
    })
  }, [])

  return {
    recent,
    seen,
    isSeen: id => seen.includes(id),
    markRecent: pushRecent,
    toggleSeen,
  }
}
