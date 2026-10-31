// Entrega o vídeo do Drive pelo nosso próprio domínio.
//
// No iPhone, o player do Drive dentro da página pede login / cookies de
// terceiros mesmo com o arquivo público. Passando o arquivo por aqui, o
// celular toca no player nativo (com tela cheia) sem ver o Drive.
// Só entrega arquivos que estão cadastrados como anúncio no acervo.

import { Readable, Transform } from 'node:stream'

export const config = { maxDuration: 60, supportsResponseStreaming: true }

const ID_RE = /^[\w-]{10,}$/

async function isRegistered(id) {
  const url = process.env.VITE_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
  if (!url || !key) return true // sem como conferir: não bloqueia a aluna
  try {
    const r = await fetch(`${url}/rest/v1/ads?select=id&drive_url=ilike.*${id}*&limit=1`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    })
    if (!r.ok) return true
    const rows = await r.json()
    return rows.length > 0
  } catch {
    return true
  }
}

async function fetchDrive(id, range) {
  const headers = { 'User-Agent': 'Mozilla/5.0' }
  if (range) headers.Range = range
  const base = `https://drive.usercontent.google.com/download?id=${id}&export=download&confirm=t`
  let r = await fetch(base, { headers, redirect: 'follow' })
  const ct = r.headers.get('content-type') || ''
  if (ct.includes('text/html')) {
    // Página de aviso ("não foi possível verificar vírus") em arquivos grandes: confirma e tenta de novo
    const html = await r.text()
    const uuid = html.match(/name="uuid"\s+value="([^"]+)"/)?.[1]
    if (uuid) r = await fetch(`${base}&uuid=${encodeURIComponent(uuid)}`, { headers, redirect: 'follow' })
  }
  return r
}

// Recorta um trecho (bytes start..end) de um fluxo que veio inteiro
function slice(start, end) {
  let pos = 0
  return new Transform({
    transform(chunk, _enc, cb) {
      const from = pos
      const to = pos + chunk.length // exclusivo
      pos = to
      const s = Math.max(start, from)
      const e = end == null ? to : Math.min(end + 1, to)
      if (s < e) this.push(chunk.subarray(s - from, e - from))
      if (end != null && to > end) this.push(null)
      cb()
    },
  })
}

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD')
    return res.status(405).end()
  }

  const id = String(req.query?.id || '')
  if (!ID_RE.test(id)) return res.status(400).end('id inválido')
  if (!(await isRegistered(id))) return res.status(404).end('não encontrado')

  const range = req.headers.range
  let upstream
  try {
    upstream = await fetchDrive(id, range)
  } catch (err) {
    return res.status(502).end(`drive indisponível: ${err?.message || err}`)
  }

  // Diagnóstico: /api/video?id=...&debug=1 mostra o que o Drive respondeu, sem o vídeo
  if (req.query?.debug) {
    const ct = upstream.headers.get('content-type') || ''
    const amostra = ct.includes('text/html') ? (await upstream.text()).slice(0, 400) : null
    return res.status(200).json({
      id,
      range: range || null,
      drive: {
        status: upstream.status,
        url: upstream.url,
        contentType: ct,
        contentLength: upstream.headers.get('content-length'),
        contentRange: upstream.headers.get('content-range'),
        acceptRanges: upstream.headers.get('accept-ranges'),
        contentDisposition: upstream.headers.get('content-disposition'),
      },
      amostraHtml: amostra,
    })
  }

  if (!upstream.ok && upstream.status !== 206) {
    return res.status(upstream.status === 404 ? 404 : 502).end(`drive respondeu ${upstream.status}`)
  }

  const ct = upstream.headers.get('content-type') || ''
  const type = ct && !ct.includes('octet-stream') && !ct.includes('text/html') ? ct : 'video/mp4'
  res.setHeader('Content-Type', type)
  res.setHeader('Accept-Ranges', 'bytes')
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400')
  const disp = upstream.headers.get('content-disposition')
  if (disp) res.setHeader('Content-Disposition', disp.replace(/^attachment/i, 'inline'))

  const length = upstream.headers.get('content-length')
  const contentRange = upstream.headers.get('content-range')

  // O Drive honrou o Range: repassa como veio
  if (upstream.status === 206 && contentRange) {
    res.status(206)
    res.setHeader('Content-Range', contentRange)
    if (length) res.setHeader('Content-Length', length)
    if (req.method === 'HEAD') return res.end()
    return Readable.fromWeb(upstream.body).pipe(res)
  }

  // Veio inteiro: se pediram um trecho, recorta aqui
  const total = length ? Number(length) : null
  const m = range && /bytes=(\d*)-(\d*)/.exec(range)
  if (m && (m[1] || m[2])) {
    let start = m[1] ? Number(m[1]) : null
    let end = m[2] ? Number(m[2]) : null
    if (start == null) {
      // sufixo: os últimos N bytes
      start = total != null ? Math.max(0, total - end) : 0
      end = total != null ? total - 1 : null
    } else if (end == null || (total != null && end >= total)) {
      end = total != null ? total - 1 : null
    }
    if (total != null && start >= total) {
      res.setHeader('Content-Range', `bytes */${total}`)
      return res.status(416).end()
    }
    res.status(206)
    res.setHeader('Content-Range', `bytes ${start}-${end ?? ''}/${total ?? '*'}`)
    if (end != null) res.setHeader('Content-Length', String(end - start + 1))
    if (req.method === 'HEAD') return res.end()
    return Readable.fromWeb(upstream.body).pipe(slice(start, end)).pipe(res)
  }

  res.status(200)
  if (length) res.setHeader('Content-Length', length)
  if (req.method === 'HEAD') return res.end()
  return Readable.fromWeb(upstream.body).pipe(res)
}
