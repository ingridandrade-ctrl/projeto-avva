import { useEffect } from 'react'
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
  const { isSeen, toggleSeen, markRecent } = useActivity()

  const index = list.findIndex(a => a.id === ad.id)
  const prev = index > 0 ? list[index - 1] : null
  const next = index >= 0 && index < list.length - 1 ? list[index + 1] : null

  useEffect(() => {
    markRecent(ad.id)
  }, [ad.id]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft' && prev && onNavigate) onNavigate(prev)
      if (e.key === 'ArrowRight' && next && onNavigate) onNavigate(next)
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [onClose, onNavigate, prev, next])

  const paragraphs = toParagraphs(ad.analysis)
  const seen = isSeen(ad.id)

  return (
    <div className="ad-modal" onClick={onClose} role="dialog" aria-modal="true" aria-label={ad.title}>
      <div className="ad-modal__panel" onClick={e => e.stopPropagation()}>
        <button className="ad-modal__close" onClick={onClose} aria-label="Fechar">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>

        <div className="ad-modal__media">
          <DriveEmbed key={ad.id} url={ad.drive_url} title={ad.title} />
        </div>

        <div className="ad-modal__content">
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
              {seen ? 'Visto' : 'Marcar como visto'}
            </button>
            <button
              type="button"
              className={`ad-modal__pill ad-modal__pill--fav ${isFavorite ? 'ad-modal__pill--on' : ''}`}
              onClick={() => onToggleFavorite(ad.id)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              {isFavorite ? 'Favorito' : 'Favoritar'}
            </button>
            {ad.drive_url && (
              <a className="ad-modal__link" href={ad.drive_url} target="_blank" rel="noreferrer">
                Abrir no Drive
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              </a>
            )}
          </div>

          {onNavigate && (prev || next) && (
            <div className="ad-modal__nav">
              <button type="button" className="ad-modal__navbtn" disabled={!prev} onClick={() => prev && onNavigate(prev)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                <span>
                  <small>Anterior</small>
                  {prev ? prev.title : '—'}
                </span>
              </button>
              <button type="button" className="ad-modal__navbtn ad-modal__navbtn--next" disabled={!next} onClick={() => next && onNavigate(next)}>
                <span>
                  <small>Próximo</small>
                  {next ? next.title : '—'}
                </span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
