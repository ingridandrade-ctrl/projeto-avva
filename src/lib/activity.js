// Atividade da aluna neste aparelho (recentes e "visto").
// Guardado no navegador — simples e instantâneo.

const RECENT_KEY = 'avva_recent'
const SEEN_KEY = 'avva_seen'
const EVT = 'avva-activity'

function read(key) {
  try {
    const v = JSON.parse(localStorage.getItem(key) || '[]')
    return Array.isArray(v) ? v : []
  } catch {
    return []
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* modo privado etc. */
  }
  window.dispatchEvent(new Event(EVT))
}

export function getRecent() {
  return read(RECENT_KEY)
}

export function pushRecent(adId) {
  const list = [adId, ...read(RECENT_KEY).filter(id => id !== adId)].slice(0, 20)
  write(RECENT_KEY, list)
}

export function getSeen() {
  return read(SEEN_KEY)
}

export function isSeen(adId) {
  return read(SEEN_KEY).includes(adId)
}

export function markSeen(adId) {
  const list = read(SEEN_KEY)
  if (!list.includes(adId)) write(SEEN_KEY, [...list, adId])
}

export function toggleSeen(adId) {
  const list = read(SEEN_KEY)
  write(SEEN_KEY, list.includes(adId) ? list.filter(id => id !== adId) : [...list, adId])
}

export function onActivityChange(fn) {
  window.addEventListener(EVT, fn)
  window.addEventListener('storage', fn)
  return () => {
    window.removeEventListener(EVT, fn)
    window.removeEventListener('storage', fn)
  }
}
