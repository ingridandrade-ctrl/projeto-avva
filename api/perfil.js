// Meu Perfil da aluna: salva o nome e a foto.
//
// Passa pelo servidor (com a chave de serviço) em vez de gravar direto do
// navegador: assim não depende das regras de permissão do Supabase, que,
// quando faltam, fazem o banco ignorar a alteração sem dar erro.
// Quem chama manda o token da sessão; só mexe no próprio perfil.
//
// POST /api/perfil  (Authorization: Bearer <token>)
//   { name }                          troca o nome
//   { foto: <base64>, tipo: 'image/webp' }   troca a foto (máx. 1 MB)
//   { removerFoto: true }             tira a foto
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const LIMITE_FOTO = 1024 * 1024 // 1 MB
const TIPOS = { 'image/webp': 'webp', 'image/jpeg': 'jpg', 'image/png': 'png', 'image/heic': 'heic', 'image/heif': 'heif' }

async function alunaDoToken(req) {
  const auth = req.headers.authorization || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''
  if (!token) return null
  const { data, error } = await supabase.auth.getUser(token)
  if (error || !data?.user) return null
  return data.user
}

// Caminho do arquivo dentro do bucket a partir da URL pública
function caminhoDaFoto(url) {
  const parte = String(url || '').split('/avatars/')[1]
  return parte ? decodeURIComponent(parte.split('?')[0]) : null
}


export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const user = await alunaDoToken(req)
  if (!user) return res.status(401).json({ error: 'Sessão expirada. Entre de novo.' })

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {})

  const { data: atual, error: lerErr } = await supabase.from('users').select('id, avatar_url').eq('id', user.id).maybeSingle()
  if (lerErr) {
    console.error('perfil: ler', lerErr)
    return res.status(500).json({ error: 'Não consegui ler o seu perfil.' })
  }
  if (!atual) return res.status(404).json({ error: 'Perfil não encontrado.' })

  const patch = {}

  if (typeof body.name === 'string') {
    const name = body.name.trim().slice(0, 120)
    if (!name) return res.status(400).json({ error: 'Escreva o seu nome.' })
    patch.name = name
  }

  let fotoAntiga = null
  if (body.removerFoto) {
    patch.avatar_url = null
    fotoAntiga = caminhoDaFoto(atual.avatar_url)
  } else if (body.foto) {
    const ext = TIPOS[body.tipo]
    if (!ext) return res.status(400).json({ error: 'Formato de foto não aceito. Use JPG, PNG ou HEIC.' })
    const bytes = Buffer.from(String(body.foto), 'base64')
    if (!bytes.length) return res.status(400).json({ error: 'Foto vazia.' })
    if (bytes.length > LIMITE_FOTO) return res.status(400).json({ error: 'Essa foto ficou maior que 1 MB. Tenta outra.' })

    const caminho = `${user.id}/${Date.now()}.${ext}`
    const { error: upErr } = await supabase.storage.from('avatars').upload(caminho, bytes, { contentType: body.tipo, cacheControl: '31536000' })
    if (upErr) {
      console.error('perfil: upload', upErr)
      const semBucket = /bucket|not found/i.test(upErr.message || '')
      return res.status(500).json({ error: semBucket ? 'O espaço das fotos ainda não existe: rode supabase-migration-foto.sql no Supabase.' : 'Não consegui guardar a foto agora.' })
    }
    patch.avatar_url = supabase.storage.from('avatars').getPublicUrl(caminho).data?.publicUrl
    fotoAntiga = caminhoDaFoto(atual.avatar_url)
  }

  if (!Object.keys(patch).length) return res.status(400).json({ error: 'Nada para salvar.' })

  const { data: perfil, error } = await supabase.from('users').update(patch).eq('id', user.id).select('*').maybeSingle()
  if (error) {
    console.error('perfil: salvar', error)
    const semColuna = /avatar_url/.test(error.message || '')
    return res.status(500).json({ error: semColuna ? 'Falta o campo da foto: rode supabase-migration-foto.sql no Supabase.' : 'Não consegui salvar agora.' })
  }

  if (fotoAntiga) await supabase.storage.from('avatars').remove([fotoAntiga]).catch(() => {})

  return res.status(200).json({ profile: perfil })
}
