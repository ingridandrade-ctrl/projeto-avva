// Utilidades para links do Google Drive
import { belongsTo } from './catalog'

export function driveId(url) {
  const m = (url || '').match(/\/d\/([a-zA-Z0-9_-]+)/) || (url || '').match(/[?&]id=([a-zA-Z0-9_-]+)/)
  return m ? m[1] : null
}

// Capa gerada pelo próprio Drive (frame do vídeo, a imagem ou a 1ª página do PDF)
// Segunda fonte de capa quando o thumbnail do Drive falha (alguns arquivos não geram)
export function driveThumbAlt(url, width = 900) {
  const id = driveId(url)
  return id ? `https://lh3.googleusercontent.com/d/${id}=w${width}` : null
}

export function driveThumb(url, width = 900) {
  const id = driveId(url)
  return id ? `https://drive.google.com/thumbnail?id=${id}&sz=w${width}` : null
}

// Aceita link do Drive OU uma URL de imagem qualquer
export function resolveCover(url, width = 900) {
  if (!url) return null
  return driveThumb(url, width) || url
}

// Capa de uma coleção: a imagem cadastrada no admin ou, na falta dela,
// a miniatura do primeiro anúncio da coleção.
export function collectionCover(col, ads = [], width = 900) {
  if (!col) return null
  if (col.cover_url) return resolveCover(col.cover_url, width)
  const first = ads.find(a => a.drive_url && belongsTo(a, col))
  return first ? driveThumb(first.drive_url, width) : null
}
