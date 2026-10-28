// Chama as funções do admin em /api (que usam a chave de serviço no servidor).
// Manda o token da sessão pra provar que é admin.
export async function adminApi(session, action, data = {}) {
  const token = session?.access_token
  if (!token) return { error: 'Sessão expirada. Entre de novo.' }
  try {
    const r = await fetch('/api/admin-alunas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ action, ...data }),
    })
    const body = await r.json().catch(() => ({}))
    if (!r.ok) return { error: body.error || `Erro ${r.status}` }
    return body
  } catch {
    return { error: 'Sem conexão com o servidor.' }
  }
}

export const EVENT_LABELS = {
  purchase_approved: 'Compra aprovada',
  refund: 'Reembolso',
  chargeback: 'Chargeback',
  checkout_abandonment: 'Abandono de checkout',
  pix_gerado: 'Pix gerado',
  purchase_refused: 'Cartão recusado',
}
