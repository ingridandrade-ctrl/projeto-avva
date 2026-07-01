import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import Button from '../../components/ui/Button'
import './AdminDashboard.css'

export default function AdminDashboard() {
  const [modules, setModules] = useState([])
  const [stats, setStats] = useState({})
  const [kitCount, setKitCount] = useState(0)

  useEffect(() => {
    async function load() {
      const { data: mods } = await supabase
        .from('modules')
        .select('*')
        .order('order')
      setModules(mods || [])

      const { data: ads } = await supabase
        .from('ads')
        .select('id, module_id')
      const counts = {}
      let total = 0
      for (const ad of (ads || [])) {
        counts[ad.module_id] = (counts[ad.module_id] || 0) + 1
        total++
      }
      counts._total = total
      setStats(counts)

      const { count } = await supabase
        .from('kit_items')
        .select('id', { count: 'exact', head: true })
      setKitCount(count || 0)
    }
    load()
  }, [])

  return (
    <div className="admin-dash">
      <div className="admin-dash__header">
        <h1>Painel Admin</h1>
        <div className="admin-dash__actions">
          <Link to="/admin/ads/new"><Button>Novo anúncio</Button></Link>
          <Link to="/admin/kit"><Button variant="secondary">Kit de Execução</Button></Link>
        </div>
      </div>

      <div className="admin-dash__stats">
        <div className="admin-stat-card admin-stat-card--highlight">
          <span className="admin-stat-card__number">{stats._total || 0}</span>
          <span className="admin-stat-card__label">Total de anúncios</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-card__number">{kitCount}</span>
          <span className="admin-stat-card__label">Itens no Kit</span>
        </div>
      </div>

      <h2>Anúncios por módulo</h2>
      <div className="admin-dash__modules">
        {modules
          .filter(m => m.slug !== 'kit-execucao')
          .map(mod => (
            <Link
              key={mod.id}
              to={`/admin/ads?module=${mod.id}`}
              className="admin-module-row"
            >
              <span className="admin-module-row__title">{mod.title}</span>
              <span className="admin-module-row__count">
                {stats[mod.id] || 0} anúncios
              </span>
            </Link>
          ))}
      </div>
    </div>
  )
}
