import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// ── Rede de segurança: confere a compra direto na Cakto ──
// Se o webhook falhou e a aluna não existe na base, o login pergunta à Cakto
// se esse e-mail tem pedido pago. Se tem, cria a conta na hora.
// Precisa de uma Chave de API da Cakto (escopos read + orders) nas variáveis
// CAKTO_CLIENT_ID e CAKTO_CLIENT_SECRET. Sem elas, o passo é pulado.
const CAKTO_API = 'https://api.cakto.com.br'
let caktoToken = { value: null, expiresAt: 0 }

async function getCaktoToken() {
  const clientId = process.env.CAKTO_CLIENT_ID
  const clientSecret = process.env.CAKTO_CLIENT_SECRET
  if (!clientId || !clientSecret) return null
  if (caktoToken.value && Date.now() < caktoToken.expiresAt - 60_000) return caktoToken.value

  const r = await fetch(`${CAKTO_API}/public_api/token/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret }),
  })
  if (!r.ok) {
    console.error('cakto token error', r.status, await r.text().catch(() => ''))
    return null
  }
  const t = await r.json()
  caktoToken = { value: t.access_token, expiresAt: Date.now() + (t.expires_in || 3600) * 1000 }
  return caktoToken.value
}

function isKitProduct(product) {
  const kitId = process.env.CAKTO_KIT_PRODUCT_ID
  if (kitId && (product?.id === kitId || product?.short_id === kitId)) return true
  return /kit de execu/i.test(product?.name || '')
}

// Devolve { name, hasKit, orderId } se a Cakto tiver compra paga desse e-mail; senão null
async function findPaidPurchaseOnCakto(email) {
  try {
    const token = await getCaktoToken()
    if (!token) return null
    const qs = new URLSearchParams({ customer: email, status: 'paid', limit: '20' })
    const r = await fetch(`${CAKTO_API}/public_api/orders/?${qs}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!r.ok) {
      console.error('cakto orders error', r.status, await r.text().catch(() => ''))
      return null
    }
    const { results = [] } = await r.json()
    // O filtro "customer" é textual: confirma o e-mail exato no pedido
    const mine = results.filter(o => String(o?.customer?.email || '').toLowerCase().trim() === email)
    if (!mine.length) return null
    const main = mine.find(o => !isKitProduct(o.product)) || mine[0]
    return {
      name: main?.customer?.name || '',
      hasKit: mine.some(o => isKitProduct(o.product)),
      orderId: main?.id || '',
    }
  } catch (err) {
    console.error('cakto lookup error', err)
    return null
  }
}

async function createUserFromCakto(email, purchase) {
  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email,
    email_confirm: true,
  })
  if (authError) {
    console.error('Auth error:', authError)
    return null
  }
  const { error } = await supabase.from('users').insert({
    id: authUser.user.id,
    email,
    name: purchase.name,
    has_order_bump: purchase.hasKit,
    cakto_order_id: purchase.orderId,
    access_blocked: false,
  })
  if (error) {
    console.error('Profile error:', error)
    return null
  }
  return { id: authUser.user.id, access_blocked: false }
}

// Login só por email: se o email de compra existe na base, entra.
// Gera um token de acesso via admin API (sem enviar email, sem senha).
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const email = (req.body?.email || '').toLowerCase().trim()
  if (!email) {
    return res.status(400).json({ error: 'missing_email' })
  }

  let { data: user } = await supabase
    .from('users')
    .select('id, access_blocked')
    .eq('email', email)
    .maybeSingle()

  if (!user) {
    const purchase = await findPaidPurchaseOnCakto(email)
    if (purchase) user = await createUserFromCakto(email, purchase)
  }

  if (!user) {
    return res.status(404).json({ error: 'email_not_found' })
  }

  // Reembolso ou chargeback: o webhook da Cakto bloqueia o acesso na hora
  if (user.access_blocked) {
    return res.status(403).json({ error: 'access_blocked' })
  }

  const { data, error } = await supabase.auth.admin.generateLink({
    type: 'magiclink',
    email,
  })

  if (error || !data?.properties?.hashed_token) {
    console.error('generateLink error:', error)
    return res.status(500).json({ error: 'login_failed' })
  }

  return res.status(200).json({ token_hash: data.properties.hashed_token })
}
