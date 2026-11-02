// Deixa uma imagem leve antes de subir pro Storage: no máximo `maxLado` px no
// lado maior e salva em WebP (ou JPEG, se o navegador não gerar WebP).
// Uma capa 1080×1920 em PNG costuma ter 2–5 MB; depois daqui fica em ~150–300 KB.
export async function comprimirImagem(arquivo, { maxLado = 1600, qualidade = 0.82 } = {}) {
  if (!arquivo || /gif|svg/.test(arquivo.type)) return arquivo
  const bitmap = await carregar(arquivo)
  const escala = Math.min(1, maxLado / Math.max(bitmap.width, bitmap.height))
  const w = Math.round(bitmap.width * escala)
  const h = Math.round(bitmap.height * escala)
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  canvas.getContext('2d').drawImage(bitmap, 0, 0, w, h)
  bitmap.close?.()

  let blob = await new Promise(r => canvas.toBlob(r, 'image/webp', qualidade))
  if (!blob || blob.type !== 'image/webp') blob = await new Promise(r => canvas.toBlob(r, 'image/jpeg', qualidade))
  // Se por algum motivo ficou maior, mantém o original
  return blob && blob.size < arquivo.size ? blob : arquivo
}

export function extensao(blob) {
  return blob.type === 'image/webp' ? 'webp' : blob.type === 'image/jpeg' ? 'jpg' : (blob.type.split('/')[1] || 'jpg')
}

async function carregar(arquivo) {
  if (typeof createImageBitmap === 'function') {
    try { return await createImageBitmap(arquivo) } catch { /* cai no <img> */ }
  }
  const url = URL.createObjectURL(arquivo)
  try {
    const img = new Image()
    img.src = url
    await img.decode()
    return img
  } finally {
    URL.revokeObjectURL(url)
  }
}
