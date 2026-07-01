import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

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

  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single()

  if (!user) {
    return res.status(404).json({ error: 'email_not_found' })
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
