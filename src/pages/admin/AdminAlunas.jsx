import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { adminApi, EVENT_LABELS } from '../../lib/adminApi'
import './AdminAlunas.css'

const fmtData = (iso) => new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'America/Sao_Paulo' }).format(new Date(iso)).replace('.', '')
const fmtHora = (iso) => new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' }).format(new Date(iso))

function origem(u) {
  if (u.is_admin) return { label: 'Admin', kind: 'admin' }
  if (u.cakto_order_id === 'manual') return { label: 'Liberada na mão', kind: 'manual' }
  if (u.cakto_order_id) return { label: `Cakto · ${u.cakto_order_id}`, kind: 'cakto' }
  if (u.hotmart_transaction_id) return { label: 'Hotmart', kind: 'hotmart' }
  return { label: 'Sem pedido', kind: 'none' }
}

const FILTROS = [
  { value: 'todas', label: 'Todas' },
  { value: 'ativas', label: 'Com acesso' },
  { value: 'bloqueadas', label: 'Bloqueadas' },
  { value: 'kit', label: 'Com o Kit' },
  { value: 'manual', label: 'Liberadas na mão' },
]

export default function AdminAlunas() {
  const { session } = useAuth()
  const [data, setData] = useState(null)
  const [erro, setErro] = useState(null)
  const [busca, setBusca] = useState('')
  const [filtro, setFiltro] = useState('todas')
  const [busy, setBusy] = useState(null)
  const [fb, setFb] = useState({})
  const [novo, setNovo] = useState({ email: '', name: '', hasKit: false, sendEmail: true })
  const [criando, setCriando] = useState(false)
  const [novoFb, setNovoFb] = useState(null)

  async function load() {
    const out = await adminApi(session, 'list')
    if (out.error) setErro(out.error)
    else setData(out)
  }

  // (via Promise pra não disparar setState direto dentro do efeito)
  useEffect(() => { if (session) Promise.resolve().then(load) }, [session]) // eslint-disable-line react-hooks/exhaustive-deps

  async function run(u, action, extra = {}, okMsg) {
    setBusy(u.id)
    setFb(f => ({ ...f, [u.id]: null }))
    const out = await adminApi(session, action, { id: u.id, ...extra })
    setBusy(null)
    if (out.error) {
      setFb(f => ({ ...f, [u.id]: { type: 'error', msg: out.error } }))
      return
    }
    if (okMsg) setFb(f => ({ ...f, [u.id]: { type: 'ok', msg: okMsg } }))
    load()
  }

  function remover(u) {
    if (!window.confirm(`Apagar a conta de ${u.email}?\n\nEla perde o acesso e some da lista. Não dá pra desfazer.`)) return
    run(u, 'remove')
  }

  async function criar(e) {
    e.preventDefault()
    setCriando(true)
    setNovoFb(null)
    const out = await adminApi(session, 'create', novo)
    setCriando(false)
    if (out.error) {
      setNovoFb({ type: 'error', msg: out.error })
      return
    }
    const mailMsg = out.mail?.sent ? ' E-mail de boas-vindas enviado.' : out.mail?.error ? ` Mas o e-mail falhou: ${out.mail.error}` : ''
    setNovoFb({ type: 'ok', msg: `Acesso liberado pra ${novo.email}.${mailMsg}` })
    setNovo({ email: '', name: '', hasKit: false, sendEmail: true })
    load()
  }

  const lista = useMemo(() => {
    if (!data) return []
    const t = busca.trim().toLowerCase()
    return data.users.filter(u => {
      if (filtro === 'ativas' && (u.access_blocked || u.is_admin)) return false
      if (filtro === 'bloqueadas' && !u.access_blocked) return false
      if (filtro === 'kit' && !u.has_order_bump) return false
      if (filtro === 'manual' && u.cakto_order_id !== 'manual') return false
      if (!t) return true
      return `${u.email} ${u.name || ''} ${u.cakto_order_id || ''}`.toLowerCase().includes(t)
    })
  }, [data, busca, filtro])

  const s = data?.stats

  return (
    <div className="admin-alunas">
      <div className="adm-page-header">
        <div>
          <span className="adm-eyebrow">Área de membros</span>
          <h1>Alunas</h1>
          <p>Quem tem acesso, de onde veio e o que você pode fazer por cada uma.</p>
        </div>
      </div>

      {erro && <div className="adm-card admin-alunas__erro">{erro}</div>}

      <div className="admin-alunas__stats">
        <Stat label="Hoje" value={s?.hoje} />
        <Stat label="Últimos 7 dias" value={s?.semana} />
        <Stat label="Últimos 30 dias" value={s?.mes} />
        <Stat label="Total" value={s?.total} />
        <Stat label="Com o Kit" value={s?.comKit} tone="teal" />
        <Stat label="Bloqueadas" value={s?.bloqueadas} tone={s?.bloqueadas ? 'danger' : undefined} />
      </div>

      <form className="adm-card admin-alunas__novo" onSubmit={criar}>
        <div className="admin-alunas__novo-text">
          <h2>Liberar acesso na mão</h2>
          <p>Pra bônus, parceria ou quem pagou por fora. Cria a conta na hora, sem passar pela Cakto.</p>
        </div>
        <div className="admin-alunas__novo-form">
          <input type="email" required className="adm-input" placeholder="E-mail da aluna" value={novo.email} onChange={e => setNovo(n => ({ ...n, email: e.target.value }))} />
          <input type="text" className="adm-input" placeholder="Nome (opcional)" value={novo.name} onChange={e => setNovo(n => ({ ...n, name: e.target.value }))} />
          <label className="admin-alunas__check">
            <input type="checkbox" checked={novo.hasKit} onChange={e => setNovo(n => ({ ...n, hasKit: e.target.checked }))} />
            Com o Kit
          </label>
          <label className="admin-alunas__check">
            <input type="checkbox" checked={novo.sendEmail} onChange={e => setNovo(n => ({ ...n, sendEmail: e.target.checked }))} />
            Mandar e-mail de boas-vindas
          </label>
          <button type="submit" className="adm-btn adm-btn--primary" disabled={criando}>
            {criando ? 'Liberando…' : 'Liberar acesso'}
          </button>
        </div>
        {novoFb && <span className={`admin-alunas__fb admin-alunas__fb--${novoFb.type}`}>{novoFb.msg}</span>}
      </form>

      <div className="admin-alunas__filtros">
        <input
          type="search"
          className="adm-input admin-alunas__busca"
          placeholder="Buscar por e-mail, nome ou pedido…"
          value={busca}
          onChange={e => setBusca(e.target.value)}
        />
        <div className="admin-alunas__chips">
          {FILTROS.map(f => (
            <button key={f.value} type="button" className={`admin-alunas__chip ${filtro === f.value ? 'is-on' : ''}`} onClick={() => setFiltro(f.value)}>
              {f.label}
            </button>
          ))}
        </div>
        <span className="admin-alunas__count">{lista.length} {lista.length === 1 ? 'aluna' : 'alunas'}</span>
      </div>

      {!data && !erro ? (
        <div className="adm-card"><p className="adm-empty">Carregando…</p></div>
      ) : lista.length === 0 ? (
        <div className="adm-card"><p className="adm-empty">{data?.users.length ? 'Ninguém com esses filtros.' : 'Nenhuma aluna ainda. A primeira compra aparece aqui sozinha.'}</p></div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table admin-alunas__table">
            <thead>
              <tr>
                <th>Aluna</th>
                <th>Entrou em</th>
                <th>Origem</th>
                <th>Kit</th>
                <th>Acesso</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {lista.map(u => {
                const o = origem(u)
                const f = fb[u.id]
                return (
                  <tr key={u.id} className={u.access_blocked ? 'admin-table__row--inactive' : ''}>
                    <td>
                      <div className="admin-alunas__who">
                        <strong>{u.name || <span className="admin-table__muted">Sem nome</span>}</strong>
                        <span>{u.email}</span>
                      </div>
                    </td>
                    <td className="admin-alunas__nowrap">{fmtData(u.created_at)}</td>
                    <td><span className={`admin-alunas__origem admin-alunas__origem--${o.kind}`}>{o.label}</span></td>
                    <td>
                      <button
                        className={`admin-toggle ${u.has_order_bump ? 'admin-toggle--on' : ''}`}
                        disabled={busy === u.id}
                        onClick={() => run(u, 'kit', { has: !u.has_order_bump })}
                        aria-label={u.has_order_bump ? 'Tirar o Kit' : 'Dar o Kit'}
                        title={u.has_order_bump ? 'Tem o Kit (clique pra tirar)' : 'Sem o Kit (clique pra dar)'}
                      >
                        <span className="admin-toggle__knob" />
                      </button>
                    </td>
                    <td>
                      {u.is_admin
                        ? <span className="admin-alunas__status admin-alunas__status--admin">Admin</span>
                        : u.access_blocked
                          ? <span className="admin-alunas__status admin-alunas__status--off">Bloqueado</span>
                          : <span className="admin-alunas__status admin-alunas__status--on">Liberado</span>}
                    </td>
                    <td>
                      <div className="admin-table__actions admin-alunas__acoes">
                        {!u.is_admin && (u.access_blocked
                          ? <button className="admin-btn-sm" disabled={busy === u.id} onClick={() => run(u, 'unblock', {}, 'Acesso liberado.')}>Liberar</button>
                          : <button className="admin-btn-sm" disabled={busy === u.id} onClick={() => run(u, 'block', {}, 'Acesso bloqueado.')}>Bloquear</button>)}
                        <button className="admin-btn-sm" disabled={busy === u.id} onClick={() => run(u, 'resend', {}, 'E-mail de boas-vindas reenviado.')}>Reenviar e-mail</button>
                        {!u.is_admin && <button className="admin-btn-sm admin-btn-sm--danger" disabled={busy === u.id} onClick={() => remover(u)}>Apagar</button>}
                      </div>
                      {f && <span className={`admin-alunas__fb admin-alunas__fb--${f.type}`}>{f.msg}</span>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {data?.events?.length > 0 && (
        <section className="adm-card admin-alunas__eventos">
          <h2>Últimos eventos da Cakto</h2>
          <p>O que chegou no webhook, do mais recente pro mais antigo. Serve pra conferir se uma compra foi recebida.</p>
          <ul>
            {data.events.map(e => (
              <li key={`${e.event}:${e.ref}:${e.at}`}>
                <span className="admin-alunas__ev-hora">{fmtHora(e.at)}</span>
                <span className={`admin-alunas__ev admin-alunas__ev--${e.event}`}>{EVENT_LABELS[e.event] || e.event}</span>
                <span className="admin-alunas__ev-ref">{e.ref}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

function Stat({ label, value, tone }) {
  return (
    <div className={`admin-alunas__stat ${tone ? `admin-alunas__stat--${tone}` : ''}`}>
      <strong>{value === undefined ? '…' : value}</strong>
      <span>{label}</span>
    </div>
  )
}
