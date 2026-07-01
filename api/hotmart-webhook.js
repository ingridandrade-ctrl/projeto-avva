import { createClient } from '@supabase/supabase-js'
import crypto from 'node:crypto'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

function verifyHottok(req) {
  const hottok = req.headers['x-hotmart-hottok']
  return hottok === process.env.HOTMART_HOTTOK
}

function generateTempPassword() {
  return crypto.randomBytes(6).toString('base64url')
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!verifyHottok(req)) {
    return res.status(401).json({ error: 'Invalid hottok' })
  }

  try {
    const { event, data } = req.body

    if (event !== 'PURCHASE_APPROVED' && event !== 'PURCHASE_COMPLETE') {
      return res.status(200).json({ ok: true, skipped: true })
    }

    const buyer = data?.buyer
    if (!buyer?.email) {
      return res.status(400).json({ error: 'Missing buyer email' })
    }

    const email = buyer.email.toLowerCase().trim()
    const name = buyer.name || ''
    const transactionId = data?.purchase?.transaction || ''
    const hasOrderBump = (data?.purchase?.offer?.code || '').includes('orderbump') ||
      (data?.purchase?.items || []).some(item =>
        (item.name || '').toLowerCase().includes('kit') ||
        (item.name || '').toLowerCase().includes('order bump')
      )

    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (existingUser) {
      if (hasOrderBump) {
        await supabase
          .from('users')
          .update({ has_order_bump: true })
          .eq('id', existingUser.id)
      }
      return res.status(200).json({ ok: true, existing: true })
    }

    const tempPassword = generateTempPassword()

    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
    })

    if (authError) {
      console.error('Auth error:', authError)
      return res.status(500).json({ error: 'Failed to create auth user' })
    }

    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: authUser.user.id,
        email,
        name,
        has_order_bump: hasOrderBump,
        hotmart_transaction_id: transactionId,
      })

    if (profileError) {
      console.error('Profile error:', profileError)
      return res.status(500).json({ error: 'Failed to create profile' })
    }

    return res.status(200).json({ ok: true, created: true })
  } catch (err) {
    console.error('Webhook error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
