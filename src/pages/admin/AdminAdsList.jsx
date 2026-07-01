import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import Button from '../../components/ui/Button'
import Tag from '../../components/ui/Tag'
import './AdminAdsList.css'

const MOMENT_LABELS = { topo: 'Topo', meio: 'Meio', fundo: 'Fundo' }

export default function AdminAdsList() {
  const [params] = useSearchParams()
  const moduleFilter = params.get('module')
  const [ads, setAds] = useState([])
  const [modules, setModules] = useState([])
  const [selectedModule, setSelectedModule] = useState(moduleFilter || '')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('modules').select('*').order('order').then(({ data }) => {
      setModules(data || [])
    })
  }, [])

  useEffect(() => {
    loadAds()
  }, [selectedModule])

  async function loadAds() {
    setLoading(true)
    let query = supabase
      .from('ads')
      .select('*, modules(title, slug)')
      .order('created_at', { ascending: false })
    if (selectedModule) {
      query = query.eq('module_id', selectedModule)
    }
    const { data } = await query
    setAds(data || [])
    setLoading(false)
  }

  async function handleDelete(ad) {
    if (!window.confirm(`Tem certeza que deseja deletar "${ad.title}"?`)) return
    await supabase.from('ads').delete().eq('id', ad.id)
    loadAds()
  }

  async function toggleActive(ad) {
    await supabase.from('ads').update({ active: !ad.active }).eq('id', ad.id)
    loadAds()
  }

  return (
    <div className="admin-ads">
      <div className="admin-ads__header">
        <h1>Anúncios</h1>
        <Link to="/admin/ads/new"><Button>Novo anúncio</Button></Link>
      </div>

      <div className="admin-ads__filters">
        <select
          value={selectedModule}
          onChange={e => setSelectedModule(e.target.value)}
          className="admin-select"
        >
          <option value="">Todos os módulos</option>
          {modules
            .filter(m => m.slug !== 'kit-execucao')
            .map(m => (
              <option key={m.id} value={m.id}>{m.title}</option>
            ))}
        </select>
        <span className="admin-ads__count">{ads.length} anúncios</span>
      </div>

      {loading ? (
        <p className="admin-ads__loading">Carregando...</p>
      ) : ads.length === 0 ? (
        <p className="admin-ads__empty">Nenhum anúncio cadastrado.</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Título</th>
                <th>Módulo</th>
                <th>Formato</th>
                <th>Momento</th>
                <th>Sub-nicho</th>
                <th>Ativo</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {ads.map(ad => (
                <tr key={ad.id} className={!ad.active ? 'admin-table__row--inactive' : ''}>
                  <td className="admin-table__title">{ad.title}</td>
                  <td>{ad.modules?.title || '—'}</td>
                  <td>{ad.format || '—'}</td>
                  <td>
                    {ad.moment ? (
                      <Tag type={ad.moment}>{MOMENT_LABELS[ad.moment]}</Tag>
                    ) : '—'}
                  </td>
                  <td>{ad.subniche || '—'}</td>
                  <td>
                    <button
                      className={`admin-toggle ${ad.active ? 'admin-toggle--on' : ''}`}
                      onClick={() => toggleActive(ad)}
                      aria-label={ad.active ? 'Desativar' : 'Ativar'}
                    >
                      <span className="admin-toggle__knob" />
                    </button>
                  </td>
                  <td>
                    <div className="admin-table__actions">
                      <Link to={`/admin/ads/${ad.id}/edit`} className="admin-btn-sm">
                        Editar
                      </Link>
                      <button
                        className="admin-btn-sm admin-btn-sm--danger"
                        onClick={() => handleDelete(ad)}
                      >
                        Deletar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
