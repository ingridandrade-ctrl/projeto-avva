import { useState } from 'react'
import './DriveEmbed.css'

export default function DriveEmbed({ url, title }) {
  const [loaded, setLoaded] = useState(false)

  if (!url) return null

  let embedUrl = url
  const fileIdMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/)
  if (fileIdMatch) {
    embedUrl = `https://drive.google.com/file/d/${fileIdMatch[1]}/preview`
  }

  return (
    <div className={`drive-embed${loaded ? ' drive-embed--loaded' : ''}`}>
      <iframe
        src={embedUrl}
        title={title || 'Criativo'}
        allow="autoplay; encrypted-media"
        allowFullScreen
        loading="lazy"
        onLoad={() => setLoaded(true)}
      />
    </div>
  )
}
