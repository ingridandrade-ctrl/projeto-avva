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
        <img
          className="drive-embed__img"
          src={driveThumb(url, 1600)}
          alt={title || 'Criativo'}
          onError={() => setImgFailed(true)}
        />
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
