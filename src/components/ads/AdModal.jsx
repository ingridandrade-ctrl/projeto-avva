import { useEffect, useRef } from 'react'
import DriveEmbed from './DriveEmbed'
import Tag from '../ui/Tag'
import CopyButton from '../ui/CopyButton'
import { NICHE_LABELS, MEDIA_LABELS } from '../../lib/catalog'
import { useActivity } from '../../hooks/useActivity'
import './AdModal.css'

// Divide a análise em parágrafos legíveis: quebras de linha ou, se for um
// bloco só, a cada ~2 frases.
function toParagraphs(text) {
  const raw = (text || '').trim()
  if (!raw) return []
  const byLines = raw.split(/\n+/).map(s => s.trim()).filter(Boolean)
  if (byLines.length > 1) return byLines
  const sentences = raw.match(/[^.!?…]+[.!?…]+["”)]?\s*/g) || [raw]
  const out = []
  for (let i = 0; i < sentences.length; i += 2) {
    out.push(sentences.slice(i, i + 2).join('').trim())
  }
  return out
}

export default function AdModal({
  ad,
  collectionTitle,
  isFavorite,
  onToggleFavorite,
  onClose,
  list = [],
  onNavigate,
}) {
  const { isSeen, toggleSeen, markSeen, markRecent } = useActivity()
  const touch = useRef(null)

  const index = list.findIndex(a => a.id === ad.id)
  const prev = index > 0 ? list[index - 1] : null
  const next = index >= 0 && index < list.length - 1 ? list[index + 1] : null

  // Marca como recente ao abrir e como visto depois de 8s na tela
  useEffect(() => {
    markRecent(ad.id)
    const t = setTimeout(() => markSeen?.(ad.id), 8000)
    return () => clearTimeout(t)
  }, [ad.id]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    function onKey(e) {
      const tag = (e.target?.tagName || '').toLowerCase()
      if (tag === 'input' || tag === 'textarea') return
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft' && prev && onNavigate) onNavigate(prev)
      if (e.key === 'ArrowRight' && next && onNavigate) onNavigate(next)
      if (e.key === 'f' || e.key === 'F') onToggleFavorite(ad.id)
      if (e.key === 'v' || e.key === 'V') toggleSeen(ad.id)
    }
    document.addEventListener('keydown', onKey)
    // iOS ignora overflow:hidden; fixar o body evita a página de trás rolar
    const scrollY = window.scrollY
    const body = document.body
    const prevStyle = { overflow: body.style.overflow, position: body.style.position, top: body.style.top, width: body.style.width }
    body.style.overflow = 'hidden'
    body.style.position = 'fixed'
    body.style.top = `-${scrollY}px`
    body.style.width = '100%'
    return () => {
      document.removeEventListener('keydown', onKey)
      body.style.overflow = prevStyle.overflow
      body.style.position = prevStyle.position
      body.style.top = prevStyle.top
      body.style.width = prevStyle.width
      window.scrollTo(0, scrollY)
    }
  }, [onClose, onNavigate, prev, next, ad.id, onToggleFavorite, toggleSeen])

  function onTouchStart(e) {
    touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }
  function onTouchEnd(e) {
    if (!touch.current || !onNavigate) return
    const dx = e.changedTouches[0].clientX - touch.current.x
    const dy = e.changedTouches[0].clientY - touch.current.y
    touch.current = null
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      if (dx < 0 && next) onNavigate(next)
      if (dx > 0 && prev) onNavigate(prev)
    }
  }

  const paragraphs = toParagraphs(ad.analysis)
  const seen = isSeen(ad.id)

  return (
    <div className="ad-modal" onClick={onClose} role="dialog" aria-modal="true" aria-label={ad.title}>
      <div className="ad-modal__panel" onClick={e => e.stopPropagation()}>
        <button className="ad-modal__close" onClick={onClose} aria-label="Fechar">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>

        <div className="ad-modal__media" data-media={ad.media_type} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
          <div className="ad-modal__phone">
            <DriveEmbed key={ad.id} url={ad.drive_url} title={ad.title} mediaType={ad.media_type} />
          </div>
          {onNavigate && prev && (
            <button type="button" className="ad-modal__arrow ad-modal__arrow--prev" onClick={() => onNavigate(prev)} aria-label="Anterior">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
          )}
          {onNavigate && next && (
            <button type="button" className="ad-modal__arrow ad-modal__arrow--next" onClick={() => onNavigate(next)} aria-label="Próximo">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          )}
        </div>

        <div className="ad-modal__content">
          <div className="ad-modal__handle" aria-hidden="true" />
          <div className="ad-modal__topline">
            {collectionTitle && <span className="ad-modal__eyebrow">{collectionTitle}</span>}
            {index >= 0 && list.length > 1 && (
              <span className="ad-modal__position">{index + 1} de {list.length}</span>
            )}
          </div>
          <h2 className="ad-modal__title">{ad.title}</h2>

          <div className="ad-modal__tags">
            {ad.media_type && <Tag type="teal">{MEDIA_LABELS[ad.media_type] || ad.media_type}</Tag>}
            {(ad.niches || []).map(n => <Tag key={n}>{NICHE_LABELS[n] || n}</Tag>)}
          </div>

          {paragraphs.length > 0 ? (
            <section className="ad-modal__analysis">
              <h3>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.3h6c0-1 .4-1.8 1-2.3A7 7 0 0 0 12 2z"/></svg>
                Por que funciona
              </h3>
              {paragraphs.map((p, i) => <p key={i}>{p}</p>)}
              <CopyButton text={ad.analysis} label="Copiar análise" />
            </section>
          ) : (
            <p className="ad-modal__no-analysis">A análise deste anúncio chega em breve.</p>
          )}

          <div className="ad-modal__actions">
            <button
              type="button"
              className={`ad-modal__pill ${seen ? 'ad-modal__pill--on' : ''}`}
              onClick={() => toggleSeen(ad.id)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              {seen ? 'Concluído' : 'Marcar como concluído'}
            </button>
            <button
              type="button"
              className={`ad-modal__pill ad-modal__pill--fav ${isFavorite ? 'ad-modal__pill--on' : ''}`}
              onClick={() => onToggleFavorite(ad.id)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              {isFavorite ? 'Favorito' : 'Favoritar'}
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
