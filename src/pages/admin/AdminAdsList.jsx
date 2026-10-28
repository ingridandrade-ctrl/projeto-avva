import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { NICHE_LABELS, MEDIA_LABELS, OBJECTIVE_LABELS, NICHES, MEDIA_TYPES, getCollectionStyle, belongsTo } from '../../lib/catalog'
import { driveThumb, driveId } from '../../lib/drive'
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

const norm = (s) => String(s || '').toLowerCase().replace(/\s*\(cópia\)\s*$/, '').replace(/[^\p{L}\p{N}]+/gu, ' ').trim()

const kindLabel = (col) => col.is_bonus
  ? 'Bônus'
  : getCollectionStyle(col.slug).kind === 'fixa'
    ? `Coleção ${String(col.order).padStart(2, '0')}`
    : getCollectionStyle(col.slug).kind === 'melhores' ? 'Melhores do mês' : 'Especial'

export default function AdminAdsList() {
  const [params] = useSearchParams()
  const [ads, setAds] = useState([])
  const [collections, setCollections] = useState([])
  const [selectedCollection, setSelectedCollection] = useState(params.get('collection') || '')
  const [search, setSearch] = useState('')
  const [niche, setNiche] = useState('')
  const [media, setMedia] = useState('')
  const [onlyDups, setOnlyDups] = useState(false)
  const [view, setView] = useState(() => {
    try { return localStorage.getItem('avva.admin.ads.view') || 'colecoes' } catch { return 'colecoes' }
  })
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  async function load() {
    setLoading(true)
    const [{ data: cols }, { data: adsData }] = await Promise.all([
      supabase.from('collections').select('*').order('order'),
      supabase.from('ads').select('*, collections(title, slug)').order('created_at', { ascending: false }),
    ])
    setCollections(cols || [])
    setAds(adsData || [])
    setLoading(false)
  }

  useEffect(() => { Promise.resolve().then(load) }, [])

  function changeView(v) {
    setView(v)
    try { localStorage.setItem('avva.admin.ads.view', v) } catch { /* sem armazenamento, sem problema */ }
  }

  async function handleDelete(ad) {
    if (!window.confirm(`Tem certeza que deseja deletar "${ad.title}"?`)) return
    await supabase.from('ads').delete().eq('id', ad.id)
    load()
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
    navigate(`/admin/produtos/acervo/anuncios/${data.id}/editar`)
  }

  async function toggleActive(ad) {
    await supabase.from('ads').update({ active: !ad.active }).eq('id', ad.id)
    load()
  }

  // Repetidos: mesmo arquivo do Drive ou mesmo título (ignorando "(cópia)")
  const dupInfo = useMemo(() => {
    const byFile = new Map()
    const byTitle = new Map()
    for (const a of ads) {
      const f = driveId(a.drive_url)
      if (f) byFile.set(f, (byFile.get(f) || 0) + 1)
      const t = norm(a.title)
      if (t) byTitle.set(t, (byTitle.get(t) || 0) + 1)
    }
    const info = {}
    for (const a of ads) {
      const f = driveId(a.drive_url)
      const t = norm(a.title)
      const sameFile = f ? byFile.get(f) : 0
      const sameTitle = t ? byTitle.get(t) : 0
      if (sameFile > 1) info[a.id] = `Mesmo arquivo do Drive em ${sameFile} anúncios`
      else if (sameTitle > 1) info[a.id] = `Mesmo título em ${sameTitle} anúncios`
    }
    return info
  }, [ads])
  const dupCount = Object.keys(dupInfo).length

  const term = search.trim().toLowerCase()
  const visible = ads.filter(a => {
    if (onlyDups && !dupInfo[a.id]) return false
    if (niche && !(a.niches || []).includes(niche)) return false
    if (media && a.media_type !== media) return false
    if (term && !`${a.title} ${a.analysis || ''}`.toLowerCase().includes(term)) return false
    return true
  })

  // Visão por coleção: um bloco por coleção; o anúncio com mais de um
  // objetivo aparece em cada uma. Quem não está em nenhuma vai pro fim.
  const groups = useMemo(() => {
    const cols = selectedCollection ? collections.filter(c => c.id === selectedCollection) : collections
    const out = cols.map(col => ({ col, items: visible.filter(a => belongsTo(a, col)) }))
    if (!selectedCollection) {
      const loose = visible.filter(a => !collections.some(c => belongsTo(a, c)))
      if (loose.length) out.push({ col: null, items: loose })
    }
    return out
  }, [collections, visible, selectedCollection])

  const listRows = selectedCollection
    ? visible.filter(a => { const col = collections.find(c => c.id === selectedCollection); return col && belongsTo(a, col) })
    : visible

  const row = (ad) => (
    <tr key={ad.id} className={!ad.active ? 'admin-table__row--inactive' : ''}>
      <td><CoverCheck ad={ad} /></td>
      <td className="admin-table__title">
        {ad.title}
        {dupInfo[ad.id] && <span className="admin-ads__dup" title={dupInfo[ad.id]}>repetido</span>}
      </td>
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
          <Link to={`/admin/produtos/acervo/anuncios/${ad.id}/editar`} className="admin-ads__icon" title="Editar" aria-label="Editar">
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
  )

  const table = (rows) => (
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
        <tbody>{rows.map(row)}</tbody>
      </table>
    </div>
  )

  const empty = (msg) => <div className="adm-card"><p className="adm-empty">{msg}</p></div>

  return (
    <div className="admin-ads">
      <div className="adm-page-header">
        <div>
          <span className="adm-eyebrow">Acervo de Anúncios</span>
          <h1>Anúncios</h1>
          <p>Tudo que as alunas veem nas Coleções. Desative para esconder sem apagar.</p>
        </div>
        <div className="adm-page-header__actions">
          <Link to="/admin/produtos/acervo/anuncios/novo" className="adm-btn adm-btn--primary">+ Novo anúncio</Link>
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
        <select value={selectedCollection} onChange={e => setSelectedCollection(e.target.value)} className="admin-select">
          <option value="">Todas as coleções</option>
          {collections.map(c => (
            <option key={c.id} value={c.id}>{c.is_bonus ? `Bônus — ${c.title}` : c.title}</option>
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
      </div>

      <div className="admin-ads__bar">
        <div className="admin-ads__view" role="group" aria-label="Como ver">
          <button type="button" className={view === 'colecoes' ? 'is-on' : ''} onClick={() => changeView('colecoes')}>Por coleção</button>
          <button type="button" className={view === 'lista' ? 'is-on' : ''} onClick={() => changeView('lista')}>Lista única</button>
        </div>
        <button
          type="button"
          className={`admin-ads__dupbtn ${onlyDups ? 'is-on' : ''} ${dupCount ? 'has-dups' : ''}`}
          onClick={() => setOnlyDups(v => !v)}
          disabled={!dupCount}
          title={dupCount ? 'Anúncios com o mesmo arquivo do Drive ou o mesmo título' : 'Nenhum repetido encontrado'}
        >
          {dupCount ? `${dupCount} ${dupCount === 1 ? 'repetido' : 'repetidos'}` : 'Sem repetidos'}
        </button>
        <span className="admin-ads__count">
          {visible.length} {visible.length === 1 ? 'anúncio' : 'anúncios'}
        </span>
      </div>

      {loading ? empty('Carregando…')
        : ads.length === 0 ? (
          <div className="adm-card">
            <div className="adm-empty">
              <p>Nenhum anúncio cadastrado ainda.</p>
              <Link to="/admin/produtos/acervo/anuncios/novo" className="adm-btn adm-btn--primary" style={{ marginTop: 16 }}>Cadastrar o primeiro</Link>
            </div>
          </div>
        )
        : visible.length === 0 ? empty('Nenhum anúncio com esses filtros.')
        : view === 'lista' ? (listRows.length ? table(listRows) : empty('Nenhum anúncio nessa coleção.'))
        : (
          <div className="admin-ads__groups">
            {groups.map(({ col, items }) => (
              <section key={col ? col.id : 'sem'} className={`admin-ads__group ${items.length === 0 ? 'is-empty' : ''}`}>
                <header className="admin-ads__group-head">
                  <span className="admin-ads__group-swatch" style={{ background: col ? getCollectionStyle(col.slug).gradient : 'rgba(76, 54, 45, 0.15)' }} />
                  <div>
                    <span className="adm-eyebrow">{col ? kindLabel(col) : 'Fora das coleções'}</span>
                    <h2>{col ? col.title : 'Sem coleção'}</h2>
                  </div>
                  <span className="admin-ads__group-count">{items.length} {items.length === 1 ? 'anúncio' : 'anúncios'}</span>
                </header>
                {items.length ? table(items) : <p className="admin-ads__group-empty">Nenhum anúncio aqui{col && getCollectionStyle(col.slug).kind === 'fixa' ? '. Marque o objetivo no anúncio pra ele entrar.' : '.'}</p>}
              </section>
            ))}
          </div>
        )}
    </div>
  )
}
