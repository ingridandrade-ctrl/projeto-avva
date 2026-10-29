import { useEffect, useState } from 'react'
import { driveId, driveThumb } from '../../lib/drive'
import './DriveEmbed.css'

// Mostra o criativo do Drive no formato certo:
// - imagem/carrossel: a própria imagem (sem o visualizador cinza do Drive)
// - vídeo: player do Drive em 9:16, com a miniatura como pôster enquanto carrega
// - pdf: visualizador em 3:4
export default function DriveEmbed({ url, title, mediaType = 'video' }) {
  const [loaded, setLoaded] = useState(false)
  const [imgFailed, setImgFailed] = useState(false)
  const [ratio, setRatio] = useState(null)
  const [zoom, setZoom] = useState(false) // imagem em tela cheia

  // Esc fecha a tela cheia
  useEffect(() => {
    if (!zoom) return
    const onKey = (e) => { if (e.key === 'Escape') setZoom(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [zoom])

  const poster = driveThumb(url, 1000)

  // Descobre a proporção real do criativo pela miniatura (vertical, quadrado, horizontal…)
  useEffect(() => {
    setRatio(null)
    setLoaded(false)
    setImgFailed(false)
    if (!poster) return
    let alive = true
    const img = new Image()
    img.onload = () => {
      if (!alive || !img.naturalWidth || !img.naturalHeight) return
      const r = img.naturalWidth / img.naturalHeight
      setRatio(`${Math.max(0.45, Math.min(1.9, r))}`)
    }
    img.src = poster
    return () => { alive = false }
  }, [poster])

  if (!url) return null

  const id = driveId(url)
  const embedUrl = id ? `https://drive.google.com/file/d/${id}/preview` : url
  const isImage = (mediaType === 'image' || mediaType === 'carousel') && poster && !imgFailed
  const fallbackRatio = mediaType === 'pdf' ? '3 / 4' : mediaType === 'video' ? '9 / 16' : '4 / 5'

  return (
    <div
      className={`drive-embed drive-embed--${mediaType}${loaded || isImage ? ' drive-embed--loaded' : ''}`}
      style={{ '--embed-ratio': ratio || fallbackRatio }}
    >
      {isImage ? (
        <>
          <img
            className="drive-embed__img drive-embed__img--zoomable"
            src={driveThumb(url, 2400)}
            alt={title || 'Criativo'}
            onError={() => setImgFailed(true)}
            onClick={() => setZoom(true)}
          />
          <button type="button" className="drive-embed__zoom" onClick={() => setZoom(true)} aria-label="Ver em tela cheia" title="Ver em tela cheia">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
          </button>
          {zoom && (
            <div className="drive-lightbox" onClick={() => setZoom(false)} role="dialog" aria-label="Imagem em tela cheia">
              <img src={driveThumb(url, 2400)} alt={title || 'Criativo'} onClick={e => e.stopPropagation()} />
              <button type="button" className="drive-lightbox__close" onClick={() => setZoom(false)} aria-label="Fechar">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
              <a className="drive-lightbox__open" href={url} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}>Abrir no Drive em tamanho real</a>
            </div>
          )}
        </>
      ) : (
        <>
          {poster && !loaded && <img className="drive-embed__poster" src={poster} alt="" />}
          <iframe
            src={embedUrl}
            title={title || 'Criativo'}
            allow="autoplay; encrypted-media"
            allowFullScreen
            onLoad={() => setLoaded(true)}
          />
        </>
      )}
    </div>
  )
}
