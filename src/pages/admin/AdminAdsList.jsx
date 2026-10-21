import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { NICHE_LABELS, MEDIA_LABELS } from '../../lib/catalog'
import Tag from '../../components/ui/Tag'
import './AdminAdsList.css'

export default function AdminAdsList() {
  const [params] = useSearchParams()
  const collectionFilter = params.get('collection')
  const [ads, setAds] = useState([])
  const [collections, setCollections] = useState([])
  const [selectedCollection, setSelectedCollection] = useState(collectionFilter || '')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('collections').select('*').order('order').then(({ data }) => {
      setCollections(data || [])
    })
  }, [])

  useEffect(() => {
    loadAds()
  }, [selectedCollection])

  async function loadAds() {
    setLoading(true)
    let query = supabase
      .from('ads')
      .select('*, collections(title, slug)')
      .order('created_at', { ascending: false })
    if (selectedCollection) {
      query = query.eq('collection_id', selectedCollection)
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

  const term = search.trim().toLowerCase()
  const visible = term
    ? ads.filter(a => `${a.title} ${a.analysis || ''}`.toLowerCase().includes(term))
    : ads

  return (
    <div className="admin-ads">
      <div className="adm-page-header">
        <div>
          <span className="adm-eyebrow">Acervo de Anúncios</span>
          <h1>Anúncios</h1>
          <p>Tudo que as alunas veem nas Coleções. Desative para esconder sem apagar.</p>
        </div>
        <div className="adm-page-header__actions">
          <Link to="/admin/ads/new" className="adm-btn adm-btn--primary">+ Novo anúncio</Link>
        </div>
      </div>

      <div className="admin-ads__filters">
        <input
          type="search"
          className="adm-input admin-ads__search"
          placeholder="Buscar por título ou análise…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          value={selectedCollection}
          onChange={e => setSelectedCollection(e.target.value)}
          className="admin-select"
        >
          <option value="">Todas as coleções</option>
          {collections.map(c => (
            <option key={c.id} value={c.id}>
              {c.is_bonus ? `Bônus — ${c.title}` : c.title}
            </option>
          ))}
        </select>
        <span className="admin-ads__count">
          {visible.length} {visible.length === 1 ? 'anúncio' : 'anúncios'}
        </span>
      </div>

      {loading ? (
        <div className="adm-card"><p className="adm-empty">Carregando…</p></div>
      ) : visible.length === 0 ? (
        <div className="adm-card">
          <div className="adm-empty">
            <p>{ads.length === 0 ? 'Nenhum anúncio cadastrado ainda.' : 'Nenhum anúncio com esses filtros.'}</p>
            {ads.length === 0 && (
              <Link to="/admin/ads/new" className="adm-btn adm-btn--primary" style={{ marginTop: 16 }}>
                Cadastrar o primeiro
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Título</th>
                <th>Coleção</th>
                <th>Nichos</th>
                <th>Mídia</th>
                <th>Ativo</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {visible.map(ad => (
                <tr key={ad.id} className={!ad.active ? 'admin-table__row--inactive' : ''}>
                  <td className="admin-table__title">{ad.title}</td>
                  <td>{ad.collections?.title || '—'}</td>
                  <td>
                    <div className="admin-table__tags">
                      {(ad.niches || []).map(n => (
                        <Tag key={n}>{NICHE_LABELS[n] || n}</Tag>
                      ))}
                    </div>
                  </td>
                  <td>{MEDIA_LABELS[ad.media_type] || '—'}</td>
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
