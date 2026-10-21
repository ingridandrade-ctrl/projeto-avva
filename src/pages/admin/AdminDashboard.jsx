import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import './AdminDashboard.css'

export default function AdminDashboard() {
  const [collections, setCollections] = useState([])
  const [stats, setStats] = useState({})
  const [kitCount, setKitCount] = useState(0)
  const [novasAplicacoes, setNovasAplicacoes] = useState(0)
  const [alunas, setAlunas] = useState(0)

  useEffect(() => {
    async function load() {
      const { data: cols } = await supabase
        .from('collections')
        .select('*')
        .order('order')
      setCollections(cols || [])

      const { data: ads } = await supabase
        .from('ads')
        .select('id, collection_id, active')
      const counts = {}
      let total = 0
      let active = 0
      for (const ad of (ads || [])) {
        counts[ad.collection_id] = (counts[ad.collection_id] || 0) + 1
        total++
        if (ad.active) active++
      }
      counts._total = total
      counts._active = active
      setStats(counts)

      const { count } = await supabase
        .from('kit_items')
        .select('id', { count: 'exact', head: true })
      setKitCount(count || 0)

      const { count: novas } = await supabase
        .from('aplicacoes')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'nova')
      setNovasAplicacoes(novas || 0)

      const { count: users } = await supabase
        .from('users')
        .select('id', { count: 'exact', head: true })
      setAlunas(users || 0)
    }
    load()
  }, [])

  const hora = new Date().getHours()
  const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite'

  return (
    <div className="admin-dash">
      <div className="adm-page-header">
        <div>
          <span className="adm-eyebrow">Painel</span>
          <h1>{saudacao} ✦</h1>
          <p>Visão geral dos produtos e da mentoria.</p>
        </div>
        <div className="adm-page-header__actions">
          <Link to="/admin/ads/new" className="adm-btn adm-btn--primary">+ Novo anúncio</Link>
        </div>
      </div>

      <div className="admin-dash__stats">
        <Link to="/admin/ads" className="admin-stat-card admin-stat-card--highlight">
          <span className="admin-stat-card__label">Anúncios no Acervo</span>
          <span className="admin-stat-card__number">{stats._total || 0}</span>
          <span className="admin-stat-card__sub">{stats._active || 0} ativos</span>
        </Link>
        <Link to="/admin/kit" className="admin-stat-card">
          <span className="admin-stat-card__label">Itens no Kit</span>
          <span className="admin-stat-card__number">{kitCount}</span>
          <span className="admin-stat-card__sub">ganchos, estruturas e ângulos</span>
        </Link>
        <Link to="/admin/mentoria" className="admin-stat-card">
          <span className="admin-stat-card__label">Aplicações novas</span>
          <span className="admin-stat-card__number">{novasAplicacoes}</span>
          <span className="admin-stat-card__sub">mentoria — aguardando leitura</span>
        </Link>
        <div className="admin-stat-card">
          <span className="admin-stat-card__label">Alunas cadastradas</span>
          <span className="admin-stat-card__number">{alunas}</span>
          <span className="admin-stat-card__sub">com acesso à área de membros</span>
        </div>
      </div>

      <div className="adm-card">
        <div className="adm-card__header">
          <h2>Anúncios por coleção</h2>
          <Link to="/admin/ads" className="adm-btn adm-btn--ghost adm-btn--sm">Ver todos →</Link>
        </div>
        <div className="admin-dash__modules">
          {collections.map(col => (
            <Link
              key={col.id}
              to={`/admin/ads?collection=${col.id}`}
              className="admin-module-row"
            >
              <span className="admin-module-row__order">
                {col.is_bonus ? '✦' : String(col.order).padStart(2, '0')}
              </span>
              <span className="admin-module-row__title">
                {col.title}
                <small>{col.subtitle}</small>
              </span>
              <span className="admin-module-row__count">
                {stats[col.id] || 0} {stats[col.id] === 1 ? 'anúncio' : 'anúncios'}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
