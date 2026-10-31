// Webhook da Cakto: libera (e bloqueia) o acesso à área de membros.
//
// Fluxo:
//   compra aprovada  -> cria a conta no Supabase (login só por e-mail), marca o
//                       Kit de Execução se veio como order bump e manda o e-mail
//                       de boas-vindas pelo Resend
//   reembolso / chargeback -> bloqueia o acesso na hora
//   abandono de checkout, Pix gerado, cartão recusado -> e-mail de pré-compra
//                       (um por pessoa/pedido, e nunca pra quem já tem acesso)
//
// Cadastre em Cakto > Apps > Webhook (ou pela API) a URL
//   https://metodoavva.com/api/cakto-webhook
// com os eventos purchase_approved, refund, chargeback, checkout_abandonment,
// pix_gerado e purchase_refused. O "secret" gerado pela Cakto vai na variável
// CAKTO_WEBHOOK_SECRET da Vercel.
//
// Variáveis de ambiente:
//   CAKTO_WEBHOOK_SECRET   secret do webhook (obrigatório)
//   CAKTO_KIT_PRODUCT_ID   id do produto "Kit de Execução" na Cakto (opcional:
//                          sem ele, o kit é reconhecido pelo nome do produto)
//   RESEND_API_KEY         chave do Resend (sem ela, o e-mail de boas-vindas é pulado)
//   ACERVO_FROM            remetente, ex.: "Acervo de Anúncios <acervo@metodoavva.com>"
//   ACERVO_REPLY_TO        pra onde vai a resposta da aluna (padrão suporte@metodoavva.com)
import crypto from 'node:crypto'
import { createClient } from '@supabase/supabase-js'
import { welcomeEmail, abandonEmail, pixEmail, refusedEmail } from '../lib/emails/acervo.js'

const TOLERANCE_SECONDS = 5 * 60

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Na Vercel o corpo já chega lido em req.body (objeto ou string). Sem ele,
// lê o stream. O corpo cru só existe no segundo caso; é ele que valida a
// assinatura do header. Com o corpo já lido, vale o "secret" do próprio corpo.
async function readBody(req) {
  if (req.body !== undefined && req.body !== null) {
    if (Buffer.isBuffer(req.body)) return { rawBody: req.body, payload: JSON.parse(req.body.toString('utf8') || '{}') }
    if (typeof req.body === 'string') return { rawBody: Buffer.from(req.body), payload: JSON.parse(req.body || '{}') }
    return { rawBody: null, payload: req.body }
  }
  const rawBody = await new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', c => chunks.push(c))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
  return { rawBody, payload: JSON.parse(rawBody.toString('utf8') || '{}') }
}

function safeEqual(a, b) {
  const ba = Buffer.from(String(a || ''))
  const bb = Buffer.from(String(b || ''))
  return ba.length === bb.length && crypto.timingSafeEqual(ba, bb)
}

// Valida a origem: assinatura no header (preferida) ou o campo "secret" do corpo.
function isFromCakto(req, rawBody, payload, secret) {
  const signature = req.headers['x-cakto-signature']
  const timestamp = req.headers['x-cakto-timestamp']
  if (signature && timestamp && rawBody) {
    if (Math.abs(Date.now() / 1000 - Number(timestamp)) > TOLERANCE_SECONDS) return false
    const expected = crypto.createHmac('sha256', secret).update(`${timestamp}.`).update(rawBody).digest('hex')
    // Em transição de versão o header pode trazer "v1=...,v2=..."
    return String(signature).split(',').some(s => safeEqual(s.trim(), `v1=${expected}`))
  }
  return safeEqual(payload?.secret, secret)
}

function isKitProduct(order) {
  const kitId = process.env.CAKTO_KIT_PRODUCT_ID
  const product = order?.product || {}
  if (kitId && (product.id === kitId || product.short_id === kitId)) return true
  return /kit de execu/i.test(product.name || '')
}

// Envia um e-mail pelo Resend. Sem RESEND_API_KEY, pula em silêncio.
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
  if (!r.ok) console.error('resend error', r.status, await r.text().catch(() => ''))
  return { status: r.status }
}

const sendWelcomeEmail = ({ email, name, hasKit }) => sendEmail(email, welcomeEmail({ email, name, hasKit }))

// Quem já tem acesso liberado não precisa de e-mail de pré-compra
async function hasAccess(email) {
  const { data } = await supabase
    .from('users')
    .select('id, access_blocked')
    .eq('email', email)
    .maybeSingle()
  return Boolean(data && !data.access_blocked)
}

const normalizeEmail = (v) => String(v || '').toLowerCase().trim()
const today = () => new Date().toISOString().slice(0, 10)

// checkout_abandonment vem num formato próprio: sem id, sem pedido, com os
// dados da pessoa achatados em customerName / customerEmail.
async function handleAbandonment(data) {
  const email = normalizeEmail(data?.customerEmail)
  if (!email) return { skipped: 'missing_email' }
  const key = `checkout_abandonment:${email}:${data?.offer?.id || ''}:${data?.createdAt || today()}`
  if (await alreadyProcessed(key)) return { email, duplicate: true }
  if (await hasAccess(email)) return { email, skipped: 'already_has_access' }
  const r = await sendEmail(email, abandonEmail({ name: data.customerName, checkoutUrl: data.checkoutUrl }))
  return { email, sent: true, ...r }
}

// pix_gerado e purchase_refused usam o formato de pedido. Só o produto
// principal interessa (o order bump do kit vem como pedido separado).
async function handlePreSale(event, order) {
  const email = normalizeEmail(order?.customer?.email)
  if (!email) return { skipped: 'missing_email' }
  if (order.offer_type && order.offer_type !== 'main') return { email, skipped: order.offer_type }
  if (isKitProduct(order)) return { email, skipped: 'kit' }

  // Pix: um e-mail por Pix gerado. Cartão recusado: no máximo um por dia,
  // mesmo que a pessoa tente várias vezes.
  const key = event === 'pix_gerado'
    ? `${event}:${order.id}`
    : `${event}:${email}:${today()}`
  if (await alreadyProcessed(key)) return { id: order.id, duplicate: true }
  if (await hasAccess(email)) return { id: order.id, skipped: 'already_has_access' }

  const name = order.customer?.name
  const checkoutUrl = order.checkoutUrl
  const mail = event === 'pix_gerado'
    ? pixEmail({ name, checkoutUrl, pixCode: order.pix?.qrCode, expiresAt: order.pix?.expirationDate })
    : refusedEmail({ name, checkoutUrl })
  const r = await sendEmail(email, mail)
  return { id: order.id, sent: true, ...r }
}

// Dedup: o mesmo evento pode chegar mais de uma vez (retentativas da Cakto)
async function alreadyProcessed(eventKey) {
  const { error } = await supabase.from('cakto_events').insert({ id: eventKey })
  if (!error) return false
  if (error.code === '23505') return true // chave duplicada
  console.error('cakto_events insert error:', error)
  return false // sem tabela/erro de banco: segue em frente, melhor liberar duas vezes do que nenhuma
}

async function grantAccess(order) {
  const customer = order.customer || {}
  const email = String(customer.email || '').toLowerCase().trim()
  if (!email) return { error: 'missing_email' }

  const name = customer.name || ''
  const isKit = isKitProduct(order)
  const orderId = order.id || order.refId || ''

  const { data: existing } = await supabase
    .from('users')
    .select('id, name, has_order_bump, access_blocked, cakto_order_id')
    .eq('email', email)
    .maybeSingle()

  if (existing) {
    const patch = { access_blocked: false }
    // Conta criada antes do webhook (ex.: entrou pelo login enquanto o Pix confirmava)
    // pode ter ficado sem nome: completa com o nome da compra
    if (!String(existing.name || '').trim() && name) patch.name = name
    if (isKit) patch.has_order_bump = true
    if (!existing.cakto_order_id && !isKit) patch.cakto_order_id = orderId
    await supabase.from('users').update(patch).eq('id', existing.id)
    // Compra nova de quem já tinha conta (ex.: renovação) ganha o e-mail de novo;
    // o item do kit sozinho não.
    if (!isKit) await sendWelcomeEmail({ email, name, hasKit: existing.has_order_bump })
    return { ok: true, existing: true }
  }

  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email,
    email_confirm: true,
  })
  if (authError) {
    console.error('Auth error:', authError)
    return { error: 'auth_create_failed' }
  }

  const { error: profileError } = await supabase.from('users').insert({
    id: authUser.user.id,
    email,
    name,
    has_order_bump: isKit,
    cakto_order_id: orderId,
    access_blocked: false,
  })
  if (profileError) {
    console.error('Profile error:', profileError)
    return { error: 'profile_create_failed' }
  }

  // Compra só do kit (sem o acervo) não existe no fluxo; mesmo assim, avisa.
  await sendWelcomeEmail({ email, name, hasKit: isKit })
  return { ok: true, created: true }
}

async function revokeAccess(order) {
  const email = String(order?.customer?.email || '').toLowerCase().trim()
  if (!email) return { error: 'missing_email' }
  if (isKitProduct(order)) {
    await supabase.from('users').update({ has_order_bump: false }).eq('email', email)
    return { ok: true, kitRevoked: true }
  }
  const { error } = await supabase.from('users').update({ access_blocked: true }).eq('email', email)
  if (error) {
    console.error('Block error:', error)
    return { error: 'block_failed' }
  }
  return { ok: true, blocked: true }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const secret = process.env.CAKTO_WEBHOOK_SECRET
  if (!secret) return res.status(500).json({ error: 'missing_webhook_secret' })

  let rawBody
  let payload
  try {
    ;({ rawBody, payload } = await readBody(req))
  } catch {
    return res.status(400).json({ error: 'invalid_json' })
  }

  if (!isFromCakto(req, rawBody, payload, secret)) {
    return res.status(401).json({ error: 'unauthorized' })
  }

  const event = payload.event
  // Webhook V2 manda "data" como lista (principal + order bump na mesma entrega)
  const orders = Array.isArray(payload.data) ? payload.data : [payload.data].filter(Boolean)

  const EVENTOS = ['purchase_approved', 'refund', 'chargeback', 'checkout_abandonment', 'pix_gerado', 'purchase_refused']
  if (!EVENTOS.includes(event)) {
    return res.status(200).json({ ok: true, skipped: event })
  }

  try {
    const results = []
    for (const order of orders) {
      if (event === 'checkout_abandonment') {
        results.push(await handleAbandonment(order))
        continue
      }
      if (!order?.id) continue
      if (event === 'pix_gerado' || event === 'purchase_refused') {
        results.push(await handlePreSale(event, order))
        continue
      }
      if (await alreadyProcessed(`${event}:${order.id}`)) {
        results.push({ id: order.id, duplicate: true })
        continue
      }
      if (event === 'purchase_approved') {
        if (order.status && order.status !== 'paid') {
          results.push({ id: order.id, skipped: order.status })
          continue
        }
        results.push({ id: order.id, ...(await grantAccess(order)) })
      } else {
        results.push({ id: order.id, ...(await revokeAccess(order)) })
      }
    }
    return res.status(200).json({ ok: true, event, results })
  } catch (err) {
    console.error('Webhook error:', err)
    // 200 mesmo assim: a Cakto não reenvia em erro 5xx, e o evento fica no histórico pra reenvio manual
    return res.status(200).json({ ok: false, error: 'internal_error' })
  }
}
