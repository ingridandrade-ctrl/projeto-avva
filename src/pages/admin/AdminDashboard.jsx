import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { adminApi, EVENT_LABELS } from '../../lib/adminApi'
import './AdminDashboard.css'

const TZ = 'America/Sao_Paulo'

function saudacaoBrasilia() {
  const hora = Number(
    new Intl.DateTimeFormat('pt-BR', { hour: 'numeric', hour12: false, timeZone: TZ }).format(new Date())
  )
  if (hora >= 5 && hora < 12) return 'Bom dia'
  if (hora >= 12 && hora < 18) return 'Boa tarde'
  return 'Boa noite'
}

function dataBrasilia() {
  const txt = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long', timeZone: TZ,
  }).format(new Date())
  return txt.charAt(0).toUpperCase() + txt.slice(1)
}

export default function AdminDashboard() {
  const { profile, session } = useAuth()
  const [adsCount, setAdsCount] = useState(null)
  const [kitCount, setKitCount] = useState(null)
  const [novas, setNovas] = useState(null)
  const [totalAplicacoes, setTotalAplicacoes] = useState(null)
  const [alunas, setAlunas] = useState(null)

  useEffect(() => {
    async function load() {
      const [ads, kit, nov, tot] = await Promise.all([
        supabase.from('ads').select('id', { count: 'exact', head: true }),
        supabase.from('kit_items').select('id', { count: 'exact', head: true }),
        supabase.from('aplicacoes').select('id', { count: 'exact', head: true }).eq('status', 'nova'),
        supabase.from('aplicacoes').select('id', { count: 'exact', head: true }),
      ])
      setAdsCount(ads.count || 0)
      setKitCount(kit.count || 0)
      setNovas(nov.count || 0)
      setTotalAplicacoes(tot.count || 0)
    }
    load()
  }, [])

  // Números das alunas vêm do servidor (o navegador não enxerga outras contas)
  useEffect(() => {
    if (!session) return
    Promise.resolve().then(() => adminApi(session, 'list')).then(out => { if (!out.error) setAlunas(out) })
  }, [session])

  const nome = profile?.name?.split(' ')[0] || 'Admin'
  const email = profile?.email || session?.user?.email || ''
  const n = v => (v === null ? '…' : v)

  return (
    <div className="admin-dash">
      <header className="admin-dash__hello">
        <span className="admin-dash__date">{dataBrasilia()}</span>
        <h1>{saudacaoBrasilia()}, {nome} ✦</h1>
        <p>
          Logada como <strong>{email}</strong>. Por onde você quer começar?
        </p>
      </header>

      <section className="admin-dash__numbers">
        <Link to="/admin/alunas" className="admin-dash__num">
          <strong>{n(alunas?.stats.hoje)}</strong>
          <span>alunas hoje</span>
        </Link>
        <Link to="/admin/alunas" className="admin-dash__num">
          <strong>{n(alunas?.stats.semana)}</strong>
          <span>nos últimos 7 dias</span>
        </Link>
        <Link to="/admin/alunas" className="admin-dash__num">
          <strong>{n(alunas?.stats.mes)}</strong>
          <span>nos últimos 30 dias</span>
        </Link>
        <Link to="/admin/alunas" className="admin-dash__num">
          <strong>{n(alunas?.stats.total)}</strong>
          <span>alunas no total</span>
        </Link>
      </section>

      <div className="admin-dash__areas">
        <Link to="/admin/alunas" className="area-card area-card--alunas">
          <div className="area-card__top">
            <span className="area-card__icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </span>
            {alunas?.stats.bloqueadas > 0 && <span className="area-card__badge area-card__badge--alert">{alunas.stats.bloqueadas} {alunas.stats.bloqueadas === 1 ? 'bloqueada' : 'bloqueadas'}</span>}
          </div>
          <h2>Alunas</h2>
          <p>Quem comprou, quem tem o Kit, bloqueios, reenvio do e-mail de acesso e liberação na mão.</p>
          <div className="area-card__stats">
            <span><strong>{n(alunas?.stats.total)}</strong> com acesso</span>
            <span><strong>{n(alunas?.stats.comKit)}</strong> com o Kit</span>
          </div>
          <span className="area-card__cta">Ver alunas →</span>
        </Link>

        <Link to="/admin/produtos" className="area-card area-card--produtos">
          <div className="area-card__top">
            <span className="area-card__icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8l-9-5-9 5 9 5 9-5z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/></svg>
            </span>
            <span className="area-card__badge">Área de membros</span>
          </div>
          <h2>Produtos</h2>
          <p>Acervo de Anúncios e Kit de Execução — tudo que as alunas veem.</p>
          <div className="area-card__stats">
            <span><strong>{n(adsCount)}</strong> anúncios</span>
            <span><strong>{n(kitCount)}</strong> itens no Kit</span>
          </div>
          <span className="area-card__cta">Gerenciar produtos →</span>
        </Link>

        <Link to="/admin/mentoria" className="area-card area-card--mentoria">
          <div className="area-card__top">
            <span className="area-card__icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </span>
            {novas > 0 && <span className="area-card__badge area-card__badge--alert">{novas} {novas === 1 ? 'nova' : 'novas'}</span>}
          </div>
          <h2>Mentoria</h2>
          <p>Aplicações que chegaram pelo formulário, com status e notas.</p>
          <div className="area-card__stats">
            <span><strong>{n(totalAplicacoes)}</strong> aplicações</span>
            <span><strong>{n(novas)}</strong> aguardando leitura</span>
          </div>
          <span className="area-card__cta">Ver aplicações →</span>
        </Link>
      </div>

      {alunas?.events?.length > 0 && (
        <section className="adm-card admin-dash__events">
          <div className="admin-dash__events-head">
            <h2>Últimos eventos da Cakto</h2>
            <Link to="/admin/alunas">Ver alunas →</Link>
          </div>
          <ul>
            {alunas.events.slice(0, 8).map(e => (
              <li key={`${e.event}:${e.ref}:${e.at}`}>
                <span className="admin-dash__ev-hora">{new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', timeZone: TZ }).format(new Date(e.at))}</span>
                <span className={`admin-dash__ev admin-dash__ev--${e.event}`}>{EVENT_LABELS[e.event] || e.event}</span>
                <span className="admin-dash__ev-ref">{e.ref}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
