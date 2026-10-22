import { useState } from 'react'
import { driveId, driveThumb } from '../../lib/drive'
import './DriveEmbed.css'

// Mostra o criativo do Drive no formato certo:
// - imagem/carrossel: a própria imagem (sem o visualizador cinza do Drive)
// - vídeo: player do Drive em 9:16, com a miniatura como pôster enquanto carrega
// - pdf: visualizador em 3:4
export default function DriveEmbed({ url, title, mediaType = 'video' }) {
  const [loaded, setLoaded] = useState(false)
  const [imgFailed, setImgFailed] = useState(false)

  if (!url) return null

  const id = driveId(url)
  const embedUrl = id ? `https://drive.google.com/file/d/${id}/preview` : url
  const poster = driveThumb(url, 1000)
  const isImage = (mediaType === 'image' || mediaType === 'carousel') && poster && !imgFailed
  const ratio = mediaType === 'pdf' ? '3 / 4' : '9 / 16'

  return (
    <div
      className={`drive-embed drive-embed--${mediaType}${loaded || isImage ? ' drive-embed--loaded' : ''}`}
      style={{ '--embed-ratio': ratio }}
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
