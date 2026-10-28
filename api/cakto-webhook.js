// Webhook da Cakto: libera (e bloqueia) o acesso à área de membros.
//
// Fluxo:
//   compra aprovada  -> cria a conta no Supabase (login só por e-mail), marca o
//                       Kit de Execução se veio como order bump e manda o e-mail
//                       de boas-vindas pelo Resend
//   reembolso / chargeback -> bloqueia o acesso na hora
//
// Cadastre em Cakto > Apps > Webhook (ou pela API) a URL
//   https://metodoavva.com/api/cakto-webhook
// com os eventos purchase_approved, refund e chargeback. O "secret" gerado
// pela Cakto vai na variável CAKTO_WEBHOOK_SECRET da Vercel.
//
// Variáveis de ambiente:
//   CAKTO_WEBHOOK_SECRET   secret do webhook (obrigatório)
//   CAKTO_KIT_PRODUCT_ID   id do produto "Kit de Execução" na Cakto (opcional:
//                          sem ele, o kit é reconhecido pelo nome do produto)
//   RESEND_API_KEY         chave do Resend (sem ela, o e-mail de boas-vindas é pulado)
//   ACERVO_FROM            remetente, ex.: "Acervo de Anúncios <suporte@metodoavva.com>"
import crypto from 'node:crypto'
import { createClient } from '@supabase/supabase-js'

export const config = { api: { bodyParser: false } }

const SITE = 'https://metodoavva.com'
const LOGIN_URL = `${SITE}/login`
const TOLERANCE_SECONDS = 5 * 60

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', c => chunks.push(c))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
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
  if (signature && timestamp) {
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

const esc = (v) => String(v ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

async function sendWelcomeEmail({ email, name, hasKit }) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return { skipped: true }

  const from = process.env.ACERVO_FROM || 'Acervo de Anúncios <suporte@metodoavva.com>'
  const primeiroNome = (name || '').trim().split(/\s+/)[0] || ''
  const saudacao = primeiroNome ? `Oi, ${esc(primeiroNome)}!` : 'Oi!'

  const passo = (n, titulo, texto) => `
    <tr>
      <td style="padding:0 14px 18px 0;vertical-align:top">
        <div style="width:34px;height:34px;border-radius:50%;background:#A85C35;color:#fff;font-weight:700;font-size:15px;line-height:34px;text-align:center">${n}</div>
      </td>
      <td style="padding:0 0 18px;vertical-align:top">
        <div style="font-size:16px;font-weight:700;color:#2B1A12;line-height:1.3">${titulo}</div>
        <div style="font-size:14px;line-height:1.55;color:#6b5a52;margin-top:4px">${texto}</div>
      </td>
    </tr>`

  const html = `
  <div style="margin:0;padding:32px 16px;background:#F7F4F0;font-family:Outfit,Inter,-apple-system,Segoe UI,Helvetica,Arial,sans-serif">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #eee7df;border-radius:22px;overflow:hidden">
      <div style="padding:32px 32px 28px;background:#2B1A12;text-align:center">
        <div style="font-size:40px;line-height:0.9;font-weight:800;letter-spacing:-0.05em;color:#ffffff">acervo</div>
        <div style="font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:28px;line-height:1;color:#D4B99A;margin-top:2px">de anúncios</div>
      </div>
      <div style="padding:28px 32px 8px">
        <div style="font-size:22px;font-weight:700;color:#2B1A12;line-height:1.25">${saudacao} Seu acervo está liberado.</div>
        <p style="margin:12px 0 0;font-size:15px;line-height:1.6;color:#6b5a52">
          A partir de agora você tem acesso aos anúncios que já estão vendendo, organizados por objetivo e com a análise do porquê funcionam. Entrar leva menos de um minuto:
        </p>
        <table style="width:100%;border-collapse:collapse;margin-top:24px">
          ${passo(1, 'Abra a área de membros', `Toque no botão abaixo ou acesse <a href="${LOGIN_URL}" style="color:#A85C35">metodoavva.com/login</a>. Funciona no celular.`)}
          ${passo(2, 'Digite o e-mail da compra', `Use exatamente este e-mail: <strong style="color:#2B1A12">${esc(email)}</strong>. Não tem senha.`)}
          ${passo(3, 'Comece pela coleção do seu objetivo', 'Escolha o que você precisa hoje (ser descoberta, gerar autoridade, vender agora...), leia a análise e adapte a estrutura pro seu negócio.')}
        </table>
        <div style="text-align:center;margin:8px 0 24px">
          <a href="${LOGIN_URL}" style="display:inline-block;padding:16px 32px;background:#A85C35;color:#ffffff;text-decoration:none;border-radius:100px;font-weight:700;font-size:16px">Entrar no acervo</a>
        </div>
        ${hasKit ? `
        <div style="padding:16px 18px;background:#F7F4F0;border-left:3px solid #0C4747;border-radius:12px;margin-bottom:24px">
          <div style="font-size:13px;color:#0C4747;font-weight:700;margin-bottom:4px">Seu Kit de Execução também está liberado</div>
          <div style="font-size:14px;line-height:1.55;color:#6b5a52">Ganchos prontos, estruturas narrativas e prompts de IA. Está no menu da área de membros, em "Kit".</div>
        </div>` : ''}
        <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#6b5a52">
          Todo mês entra uma curadoria nova em "Melhores do mês". Salve nos favoritos o que fizer sentido pra você e volte sempre que for criar um anúncio.
        </p>
      </div>
      <div style="padding:18px 32px;border-top:1px solid #eee7df;font-size:12px;line-height:1.6;color:#8a7a72">
        Qualquer dúvida, é só responder este e-mail. Você tem 7 dias de garantia: se não fizer sentido, pede o reembolso e recebe 100% de volta.<br />
        Método AVVA
      </div>
    </div>
  </div>`

  const texto = [
    `${primeiroNome ? `Oi, ${primeiroNome}!` : 'Oi!'} Seu acervo está liberado.`,
    '',
    `1. Abra ${LOGIN_URL}`,
    `2. Digite o e-mail da compra: ${email} (não tem senha)`,
    '3. Comece pela coleção do seu objetivo',
    hasKit ? '\nSeu Kit de Execução também está liberado, no menu "Kit".' : '',
    '',
    'Qualquer dúvida, responda este e-mail. 7 dias de garantia.',
    'Método AVVA',
  ].join('\n')

  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from,
      to: [email],
      subject: 'Seu acervo está liberado: veja como entrar',
      html,
      text: texto,
    }),
  })
  if (!r.ok) console.error('resend error', r.status, await r.text().catch(() => ''))
  return { status: r.status }
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
    .select('id, has_order_bump, access_blocked')
    .eq('email', email)
    .maybeSingle()

  if (existing) {
    const patch = { access_blocked: false }
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
    rawBody = await readRawBody(req)
    payload = JSON.parse(rawBody.toString('utf8') || '{}')
  } catch {
    return res.status(400).json({ error: 'invalid_json' })
  }

  if (!isFromCakto(req, rawBody, payload, secret)) {
    return res.status(401).json({ error: 'unauthorized' })
  }

  const event = payload.event
  // Webhook V2 manda "data" como lista (principal + order bump na mesma entrega)
  const orders = Array.isArray(payload.data) ? payload.data : [payload.data].filter(Boolean)

  if (event !== 'purchase_approved' && event !== 'refund' && event !== 'chargeback') {
    return res.status(200).json({ ok: true, skipped: event })
  }

  try {
    const results = []
    for (const order of orders) {
      if (!order?.id) continue
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
