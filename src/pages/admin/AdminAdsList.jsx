import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { NICHE_LABELS, MEDIA_LABELS, OBJECTIVE_LABELS, OBJECTIVES, NICHES, MEDIA_TYPES } from '../../lib/catalog'
import { driveThumb } from '../../lib/drive'
import Tag from '../../components/ui/Tag'
import './AdminAdsList.css'

// Miniatura da capa. Se o Drive não entregar a imagem (arquivo privado ou
// link errado), avisa aqui, antes que a aluna veja um card vazio.
function CoverCheck({ ad }) {
  const [state, setState] = useState('loading')
  const src = driveThumb(ad.drive_url, 200)
  if (!src) return <span className="admin-cover admin-cover--none" title="Sem link do Drive">sem link</span>
  return (
    <span className={`admin-cover admin-cover--${state}`} title={state === 'error' ? 'A capa não carrega: confira se o arquivo do Drive está com acesso "Qualquer pessoa com o link"' : ''}>
      <img src={src} alt="" loading="lazy" onLoad={() => setState('ok')} onError={() => setState('error')} />
      {state === 'error' && <b>!</b>}
    </span>
  )
}

export default function AdminAdsList() {
  const [params] = useSearchParams()
  const collectionFilter = params.get('collection')
  const [ads, setAds] = useState([])
  const [collections, setCollections] = useState([])
  const [selectedCollection, setSelectedCollection] = useState(collectionFilter || '')
  const [search, setSearch] = useState('')
  const [niche, setNiche] = useState('')
  const [media, setMedia] = useState('')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    supabase.from('collections').select('*').order('order').then(({ data }) => {
      setCollections(data || [])
    })
  }, [])

  useEffect(() => {
    loadAds()
  }, [selectedCollection, collections]) // eslint-disable-line react-hooks/exhaustive-deps

  async function loadAds() {
    setLoading(true)
    let query = supabase
      .from('ads')
      .select('*, collections(title, slug)')
      .order('created_at', { ascending: false })
    if (selectedCollection) {
      const col = collections.find(c => c.id === selectedCollection)
      const isObjective = col && OBJECTIVES.some(o => o.value === col.slug)
      query = isObjective
        ? query.or(`collection_id.eq.${selectedCollection},objectives.cs.{${col.slug}}`)
        : query.eq('collection_id', selectedCollection)
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

  // Cópia desativada, pra ajustar e ligar depois (ex.: o mesmo anúncio em
  // "Melhores do mês" e numa coleção por objetivo)
  async function duplicate(ad) {
    const { data, error } = await supabase
      .from('ads')
      .insert({
        title: `${ad.title} (cópia)`,
        collection_id: ad.collection_id,
        niches: ad.niches || [],
        objectives: ad.objectives || [],
        media_type: ad.media_type,
        drive_url: ad.drive_url,
        analysis: ad.analysis,
        active: false,
      })
      .select('id')
      .single()
    if (error || !data) {
      window.alert(`Não consegui duplicar: ${error?.message || 'erro'}`)
      return
    }
    navigate(`/admin/ads/${data.id}/edit`)
  }

  async function toggleActive(ad) {
    await supabase.from('ads').update({ active: !ad.active }).eq('id', ad.id)
    loadAds()
  }

  const term = search.trim().toLowerCase()
  const visible = ads.filter(a => {
    if (niche && !(a.niches || []).includes(niche)) return false
    if (media && a.media_type !== media) return false
    if (term && !`${a.title} ${a.analysis || ''}`.toLowerCase().includes(term)) return false
    return true
  })

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
        <select value={niche} onChange={e => setNiche(e.target.value)} className="admin-select">
          <option value="">Todos os nichos</option>
          {NICHES.map(n => <option key={n.value} value={n.value}>{n.label}</option>)}
        </select>
        <select value={media} onChange={e => setMedia(e.target.value)} className="admin-select">
          <option value="">Toda mídia</option>
          {MEDIA_TYPES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
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
                <th>Capa</th>
                <th>Título</th>
                <th>Coleção</th>
                <th>Objetivos</th>
                <th>Nichos</th>
                <th>Mídia</th>
                <th>Ativo</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {visible.map(ad => (
                <tr key={ad.id} className={!ad.active ? 'admin-table__row--inactive' : ''}>
                  <td><CoverCheck ad={ad} /></td>
                  <td className="admin-table__title">{ad.title}</td>
                  <td>{ad.collections?.title || '—'}</td>
                  <td>
                    <div className="admin-table__tags">
                      {(ad.objectives || []).length === 0 && <span className="admin-table__muted">—</span>}
                      {(ad.objectives || []).map(o => (
                        <Tag key={o} type="teal">{OBJECTIVE_LABELS[o] || o}</Tag>
                      ))}
                    </div>
                  </td>
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
                    <div className="admin-table__actions admin-ads__actions">
                      <Link to={`/admin/ads/${ad.id}/edit`} className="admin-ads__icon" title="Editar" aria-label="Editar">
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>
                      </Link>
                      <button className="admin-ads__icon" onClick={() => duplicate(ad)} title="Duplicar (cria uma cópia desativada pra você ajustar)" aria-label="Duplicar">
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                      </button>
                      <button className="admin-ads__icon admin-ads__icon--danger" onClick={() => handleDelete(ad)} title="Deletar" aria-label="Deletar">
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
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
