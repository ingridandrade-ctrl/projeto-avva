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

const SITE = 'https://metodoavva.com'
const LOGIN_URL = `${SITE}/login`
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

const esc = (v) => String(v ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

async function sendWelcomeEmail({ email, name, hasKit }) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return { skipped: true }

  const from = process.env.ACERVO_FROM || 'Acervo de Anúncios <suporte@metodoavva.com>'
  const primeiroNome = (name || '').trim().split(/\s+/)[0] || ''
  const saudacao = primeiroNome ? `Oiee, ${esc(primeiroNome)}! Que bom ter você aqui.` : 'Oiee! Que bom ter você aqui.'
  const WHATS = '(19) 92000-2917'
  const WHATS_URL = 'https://wa.me/5519920002917'

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

  const p = (txt) => `<p style="margin:14px 0 0;font-size:15px;line-height:1.6;color:#6b5a52">${txt}</p>`
  const b = (txt) => `<strong style="color:#2B1A12">${txt}</strong>`

  const html = `
  <div style="margin:0;padding:32px 16px;background:#F7F4F0;font-family:Outfit,Inter,-apple-system,Segoe UI,Helvetica,Arial,sans-serif">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #eee7df;border-radius:22px;overflow:hidden">
      <div style="background:#2B1A12;text-align:center;line-height:0">
        <img src="${SITE}/email/cabecalho-acervo.png" width="560" height="150" alt="acervo de anúncios" style="display:block;width:100%;max-width:560px;height:auto;margin:0 auto" />
      </div>
      <div style="padding:28px 32px 8px">
        <div style="font-size:22px;font-weight:700;color:#2B1A12;line-height:1.25">${saudacao}</div>
        ${p(`Seu ${b('Acervo de Anúncios já está liberado')}.`)}
        ${p(`A partir de agora, toda vez que você travar na hora de criar um anúncio, já tem um lugar pra encontrar as melhores referências. E o melhor: ${b('entender por que elas funcionam')}.`)}
        ${p(`Porque não adianta só reproduzir o que viu dar certo pra outra pessoa. Quando você entende a lógica, consegue fazer o seu, do seu jeito, pro seu público.`)}
        <div style="margin-top:24px;font-size:16px;font-weight:700;color:#2B1A12">Pra entrar é simples:</div>
        <table style="width:100%;border-collapse:collapse;margin-top:14px">
          ${passo(1, `Acesse <a href="${LOGIN_URL}" style="color:#2B1A12">metodoavva.com/login</a>`, 'Dá pra usar direto do celular.')}
          ${passo(2, 'Coloque o e-mail da compra', `${b(esc(email))}. ${b('Não precisa de senha.')}`)}
          ${passo(3, 'Dentro, os anúncios estão organizados por objetivo', 'Ser descoberta, gerar autoridade, provar que funciona, vender agora. É só começar pelo que faz mais sentido pra você hoje.')}
        </table>
        <div style="text-align:center;margin:8px 0 24px">
          <a href="${LOGIN_URL}" style="display:inline-block;padding:16px 32px;background:#A85C35;color:#ffffff;text-decoration:none;border-radius:100px;font-weight:700;font-size:16px">Entrar no acervo</a>
        </div>
        ${hasKit ? `
        <div style="padding:16px 18px;background:#F7F4F0;border-left:3px solid #0C4747;border-radius:12px;margin-bottom:20px">
          <div style="font-size:13px;color:#0C4747;font-weight:700;margin-bottom:4px">Seu Kit de Execução também está liberado</div>
          <div style="font-size:14px;line-height:1.55;color:#6b5a52">Ganchos prontos, estruturas narrativas e prompts de IA. Está no menu da área de membros, em "Kit".</div>
        </div>` : ''}
        ${p(`Todo mês colocamos uma curadoria nova em ${b('"Melhores do mês"')}, então vale voltar sempre que você for criar algo novo.`)}
        ${p(`Se você não conseguir acessar com o seu e-mail de primeira, pode ser que o sistema ainda esteja processando o seu cadastro. ${b('Espere uns 2 minutinhos e tente de novo.')}`)}
        ${p(`Se mesmo assim você não conseguir acessar, pode responder este e-mail ou ${b('chamar a gente no WhatsApp pelo botão abaixo')}, que te ajudamos.`)}
        <div style="text-align:center;margin:18px 0 8px">
          <a href="${WHATS_URL}" style="display:inline-block;padding:13px 26px;background:#0C4747;color:#ffffff;text-decoration:none;border-radius:100px;font-weight:700;font-size:15px">Chamar no WhatsApp</a>
        </div>
        <p style="margin:24px 0 24px;font-size:15px;line-height:1.6;color:#6b5a52">Te vemos lá dentro,<br />${b('Equipe Acervo de Anúncios · Método AVVA')}</p>
      </div>
      <div style="padding:18px 32px;border-top:1px solid #eee7df;font-size:12px;line-height:1.6;color:#8a7a72">
        Você tem <strong>7 dias de garantia</strong>. Se não fizer sentido pra você, peça o reembolso e receba 100% de volta.
      </div>
    </div>
  </div>`

  const texto = [
    primeiroNome ? `Oiee, ${primeiroNome}! Que bom ter você aqui.` : 'Oiee! Que bom ter você aqui.',
    '',
    'Seu Acervo de Anúncios já está liberado. A partir de agora, toda vez que você travar na hora de criar um anúncio, já tem um lugar pra encontrar as melhores referências. E o melhor: entender por que elas funcionam.',
    '',
    'Pra entrar é simples:',
    `1. Acesse ${LOGIN_URL} (dá pra usar direto do celular)`,
    `2. Coloque o e-mail da compra: ${email}. Não precisa de senha.`,
    '3. Dentro, os anúncios estão organizados por objetivo. Comece pelo que faz mais sentido pra você hoje.',
    hasKit ? '\nSeu Kit de Execução também está liberado, no menu "Kit".' : '',
    '',
    'Todo mês colocamos uma curadoria nova em "Melhores do mês".',
    '',
    `Se não conseguir acessar de primeira, espere uns 2 minutinhos e tente de novo. Se mesmo assim não der, responda este e-mail ou chame a gente no WhatsApp ${WHATS}.`,
    '',
    'Te vemos lá dentro,',
    'Equipe Acervo de Anúncios · Método AVVA',
    '',
    'Você tem 7 dias de garantia. Se não fizer sentido pra você, peça o reembolso e receba 100% de volta.',
  ].join('\n')

  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from,
      to: [email],
      subject: 'Seu acervo está liberado (e leva 1 minuto pra entrar)',
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
