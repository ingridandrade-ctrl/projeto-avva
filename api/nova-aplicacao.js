// Recebe o Database Webhook do Supabase (INSERT em aplicacoes) e avisa por e-mail via Resend.
const DASHBOARD_URL = 'https://metodoavva.com/aplicacao/dashboard'

const esc = (v) => String(v ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const resumo = (v, max = 400) => {
  const s = String(v ?? '').trim()
  return s.length > max ? s.slice(0, max).trimEnd() + '…' : s
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const secret = process.env.APLICACAO_WEBHOOK_SECRET
  if (!secret || req.headers['x-webhook-secret'] !== secret) {
    return res.status(401).json({ error: 'unauthorized' })
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'missing_resend_key' })

  const payload = req.body || {}
  if (payload.type !== 'INSERT' || payload.table !== 'aplicacoes' || !payload.record) {
    return res.status(200).json({ ignored: true })
  }

  const a = payload.record
  const to = (process.env.NOTIFY_TO || 'ingridandrade@arthea.com.br,agenciaestradadigital@gmail.com')
    .split(',').map(s => s.trim()).filter(Boolean)
  const from = process.env.NOTIFY_FROM || 'Mentoria Avva <onboarding@resend.dev>'
  const origem = a.origem === 'ingrid' ? 'Ingrid' : 'Flora'

  const linha = (label, valor) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #eee7df;color:#8a7a72;font-size:13px;width:38%;vertical-align:top">${label}</td>
      <td style="padding:10px 0;border-bottom:1px solid #eee7df;color:#4C362D;font-size:15px;font-weight:500;vertical-align:top">${esc(valor) || '—'}</td>
    </tr>`

  const html = `
  <div style="margin:0;padding:32px 16px;background:#F7F4F0;font-family:Inter,-apple-system,Segoe UI,Helvetica,Arial,sans-serif">
    <div style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #eee7df;border-radius:20px;overflow:hidden">
      <div style="padding:28px 32px;background:#0C4747">
        <div style="font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#D4B99A;font-weight:600;margin-bottom:8px">Mentoria Avva · via ${origem}</div>
        <div style="font-size:24px;line-height:1.2;color:#F7F4F0;font-weight:600">Nova aplicação de ${esc(a.nome)}</div>
      </div>
      <div style="padding:24px 32px">
        <table style="width:100%;border-collapse:collapse">
          ${linha('Nicho', a.nicho)}
          ${linha('Tempo de atuação', a.tempo_atuacao)}
          ${linha('Faturamento atual', a.faturamento_atual)}
          ${linha('Objetivo em 6 meses', a.objetivo_faturamento)}
          ${linha('Preço do produto principal', a.preco_produto_principal)}
          ${linha('Momento atual', a.momento_atual)}
          ${linha('WhatsApp', a.whatsapp)}
          ${linha('E-mail', a.email)}
          ${linha('Instagram', a.instagram)}
        </table>
        <div style="margin-top:22px;padding:16px 18px;background:#F7F4F0;border-left:3px solid #A85C35;border-radius:10px">
          <div style="font-size:12px;color:#A85C35;font-weight:600;margin-bottom:6px">O que está travando o crescimento</div>
          <div style="font-size:14px;line-height:1.6;color:#4C362D;white-space:pre-wrap">${esc(resumo(a.o_que_trava))}</div>
        </div>
        <a href="${DASHBOARD_URL}" style="display:inline-block;margin-top:24px;padding:14px 24px;background:#A85C35;color:#F7F4F0;text-decoration:none;border-radius:100px;font-weight:600;font-size:15px">Abrir no dashboard →</a>
      </div>
      <div style="padding:16px 32px;border-top:1px solid #eee7df;font-size:12px;color:#8a7a72">
        Responder este e-mail responde direto para a candidata.
      </div>
    </div>
  </div>`

  const texto = [
    `Nova aplicação de ${a.nome} (via ${origem})`,
    `Nicho: ${a.nicho}`,
    `Faturamento: ${a.faturamento_atual}`,
    `WhatsApp: ${a.whatsapp}`,
    `E-mail: ${a.email}`,
    `Instagram: ${a.instagram}`,
    '',
    `Dashboard: ${DASHBOARD_URL}`,
  ].join('\n')

  const enviar = (dest) => fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from,
      to: [dest],
      reply_to: a.email || undefined,
      subject: `Nova aplicação: ${a.nome} · ${a.faturamento_atual}`,
      html,
      text: texto,
    }),
  }).then(async r => ({ dest, status: r.status, body: r.ok ? '' : await r.text().catch(() => '') }))

  // Um envio por destinatária: se o Resend recusar uma (ex.: domínio não verificado), a outra ainda recebe
  const resultados = await Promise.all(to.map(enviar))
  const falhas = resultados.filter(r => r.status >= 300)
  falhas.forEach(f => console.error('resend error', f.dest, f.status, f.body))

  if (falhas.length === resultados.length) {
    return res.status(502).json({ error: 'email_failed', resultados })
  }
  return res.status(200).json({ ok: true, resultados })
}
