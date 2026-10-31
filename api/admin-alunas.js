// Painel admin > Alunas.
//
// Tudo que o admin faz com contas passa por aqui, porque o navegador só tem
// a chave anônima do Supabase (não enxerga outras alunas nem cria contas).
// Quem chama precisa mandar o token da sessão; conferimos que é admin.
//
// POST /api/admin-alunas  { action, ...dados }
//   list      lista as alunas + números + últimos eventos da Cakto
//   block     { id }                 bloqueia o acesso
//   unblock   { id }                 libera de novo
//   kit       { id, has }            marca/desmarca o Kit de Execução
//   create    { email, name, hasKit, sendEmail }  libera acesso na mão
//   resend    { id }                 reenvia o e-mail de boas-vindas
//   remove    { id }                 apaga a conta (login + perfil)
import { createClient } from '@supabase/supabase-js'
import { welcomeEmail } from '../lib/emails/acervo.js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function requireAdmin(req) {
  const auth = req.headers.authorization || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''
  if (!token) return null
  const { data, error } = await supabase.auth.getUser(token)
  if (error || !data?.user) return null
  const { data: profile } = await supabase
    .from('users')
    .select('id, is_admin')
    .eq('id', data.user.id)
    .maybeSingle()
  return profile?.is_admin ? profile : null
}

async function sendEmail(to, { subject, html, text }) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return { skipped: true }
  const from = process.env.ACERVO_FROM || 'Acervo de Anúncios <suporte@metodoavva.com>'
  const replyTo = process.env.ACERVO_REPLY_TO || 'suporte@metodoavva.com'
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to: [to], reply_to: replyTo, subject, html, text }),
  })
  if (!r.ok) {
    const body = await r.text().catch(() => '')
    console.error('resend error', r.status, body)
    return { error: `Resend respondeu ${r.status}` }
  }
  return { sent: true }
}

const daysAgo = (n) => new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString()

async function list() {
  const [{ data: users, error }, hoje, semana, mes, { data: events }] = await Promise.all([
    supabase
      .from('users')
      .select('id, email, name, created_at, has_order_bump, access_blocked, cakto_order_id, hotmart_transaction_id, is_admin')
      .order('created_at', { ascending: false })
      .limit(1000),
    supabase.from('users').select('id', { count: 'exact', head: true }).gte('created_at', daysAgo(1)),
    supabase.from('users').select('id', { count: 'exact', head: true }).gte('created_at', daysAgo(7)),
    supabase.from('users').select('id', { count: 'exact', head: true }).gte('created_at', daysAgo(30)),
    supabase.from('cakto_events').select('id, created_at').order('created_at', { ascending: false }).limit(20),
  ])
  if (error) return { error: error.message }
  const all = users || []
  return {
    users: all,
    stats: {
      total: all.length,
      hoje: hoje.count || 0,
      semana: semana.count || 0,
      mes: mes.count || 0,
      bloqueadas: all.filter(u => u.access_blocked).length,
      comKit: all.filter(u => u.has_order_bump).length,
    },
    events: (events || []).map(e => {
      const [event, ...rest] = e.id.split(':')
      return { event, ref: rest.join(':'), at: e.created_at }
    }),
  }
}

async function create({ email, name, hasKit, sendEmail: send }) {
  email = String(email || '').toLowerCase().trim()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'E-mail inválido.' }
  const { data: existing } = await supabase.from('users').select('id').eq('email', email).maybeSingle()
  if (existing) return { error: 'Já existe uma aluna com esse e-mail.' }

  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({ email, email_confirm: true })
  if (authError) return { error: `Não consegui criar o login: ${authError.message}` }

  const { error: profileError } = await supabase.from('users').insert({
    id: authUser.user.id,
    email,
    name: String(name || '').trim(),
    has_order_bump: Boolean(hasKit),
    cakto_order_id: 'manual',
    access_blocked: false,
  })
  if (profileError) return { error: `Login criado, mas o perfil falhou: ${profileError.message}` }

  let mail = null
  if (send) mail = await sendEmail(email, welcomeEmail({ email, name, hasKit: Boolean(hasKit) }))
  return { ok: true, id: authUser.user.id, mail }
}

async function getUser(id) {
  const { data } = await supabase.from('users').select('*').eq('id', id).maybeSingle()
  return data
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const admin = await requireAdmin(req)
  if (!admin) return res.status(403).json({ error: 'Só admin.' })

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {})
  const { action, id } = body

  try {
    if (action === 'list') return res.status(200).json(await list())

    if (action === 'create') {
      const out = await create(body)
      return res.status(out.error ? 400 : 200).json(out)
    }

    if (!id) return res.status(400).json({ error: 'missing_id' })
    const user = await getUser(id)
    if (!user) return res.status(404).json({ error: 'Aluna não encontrada.' })

    if (action === 'block' || action === 'unblock') {
      if (user.is_admin && action === 'block') return res.status(400).json({ error: 'Não dá pra bloquear um admin.' })
      const { error } = await supabase.from('users').update({ access_blocked: action === 'block' }).eq('id', id)
      return res.status(error ? 500 : 200).json(error ? { error: error.message } : { ok: true })
    }

    if (action === 'kit') {
      const { error } = await supabase.from('users').update({ has_order_bump: Boolean(body.has) }).eq('id', id)
      return res.status(error ? 500 : 200).json(error ? { error: error.message } : { ok: true })
    }

    if (action === 'resend') {
      const mail = await sendEmail(user.email, welcomeEmail({ email: user.email, name: user.name, hasKit: user.has_order_bump }))
      if (mail.error) return res.status(502).json({ error: mail.error })
      if (mail.skipped) return res.status(400).json({ error: 'RESEND_API_KEY não configurada na Vercel.' })
      return res.status(200).json({ ok: true })
    }

    if (action === 'remove') {
      if (user.is_admin) return res.status(400).json({ error: 'Não dá pra apagar um admin por aqui.' })
      const { error } = await supabase.auth.admin.deleteUser(id)
      if (error) return res.status(500).json({ error: error.message })
      // O perfil cai junto (on delete cascade); garante caso a conta de login já não exista
      await supabase.from('users').delete().eq('id', id)
      return res.status(200).json({ ok: true })
    }

    return res.status(400).json({ error: 'unknown_action' })
  } catch (err) {
    console.error('admin-alunas error:', err)
    return res.status(500).json({ error: 'internal_error' })
  }
}
