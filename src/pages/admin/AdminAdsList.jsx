import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { NICHE_LABELS, MEDIA_LABELS, OBJECTIVE_LABELS, NICHES, MEDIA_TYPES, PAGE_TYPES, PAGE_TYPE_LABELS, PAGE_MEDIA_TYPES, PAGE_NICHES, PAGES_SLUG, getCollectionStyle, belongsTo, collectionKindLabel } from '../../lib/catalog'
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

const kindLabel = (col) => collectionKindLabel(col)

// kind: 'anuncio' (padrão) ou 'pagina'. As páginas moram na coleção "paginas",
// têm tipo de página em vez de objetivos e chegam como print ou PDF.
export default function AdminAdsList({ kind = 'anuncio' }) {
  const ehPagina = kind === 'pagina'
  const base = ehPagina ? '/admin/produtos/acervo/paginas' : '/admin/produtos/acervo/anuncios'
  const um = ehPagina ? 'página' : 'anúncio'
  const varios = ehPagina ? 'páginas' : 'anúncios'
  const chaveFiltros = ehPagina ? 'avva.admin.paginas.filtros' : 'avva.admin.ads.filtros'
  const [params] = useSearchParams()
  const [ads, setAds] = useState([])
  const [collections, setCollections] = useState([])
  // Filtros lembrados entre idas e vindas (editar um anúncio e voltar)
  const lembrados = (() => {
    try { return JSON.parse(sessionStorage.getItem(chaveFiltros) || '{}') } catch { return {} }
  })()
  const [selectedCollection, setSelectedCollection] = useState(params.get('collection') || lembrados.collection || '')
  const [search, setSearch] = useState(lembrados.search || '')
  const [niche, setNiche] = useState(lembrados.niche || '')
  const [media, setMedia] = useState(lembrados.media || '')
  const [onlyDups, setOnlyDups] = useState(Boolean(lembrados.onlyDups))
  const [pageType, setPageType] = useState(lembrados.pageType || '')
  const [bulkPageType, setBulkPageType] = useState('')
  const [view, setView] = useState(() => {
    if (ehPagina) return 'lista'
    try { return localStorage.getItem('avva.admin.ads.view') || 'colecoes' } catch { return 'colecoes' }
  })
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(() => new Set())
  const [bulkCol, setBulkCol] = useState('')
  const [bulkObj, setBulkObj] = useState('')
  const [bulkNiche, setBulkNiche] = useState('')
  const [bulkBusy, setBulkBusy] = useState(false)
  const [bulkMsg, setBulkMsg] = useState(null)
  const navigate = useNavigate()

  async function load() {
    setLoading(true)
    const [{ data: cols }, { data: adsData }] = await Promise.all([
      supabase.from('collections').select('*').order('order'),
      supabase.from('ads').select('*, collections(title, slug)').eq('kind', kind).order('created_at', { ascending: false }),
    ])
    // Páginas: só a coleção delas entra nos filtros; anúncios: todas as outras
    setCollections((cols || []).filter(c => ehPagina ? c.slug === PAGES_SLUG : c.slug !== PAGES_SLUG))
    setAds(adsData || [])
    setLoading(false)
  }

  useEffect(() => { Promise.resolve().then(load) }, [kind]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    try {
      sessionStorage.setItem(chaveFiltros, JSON.stringify({ collection: selectedCollection, search, niche, media, onlyDups, pageType }))
    } catch { /* sem armazenamento, sem problema */ }
  }, [chaveFiltros, selectedCollection, search, niche, media, onlyDups, pageType])

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
        kind: ad.kind || 'anuncio',
        page_type: ad.page_type || null,
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
    navigate(`${base}/${data.id}/editar`)
  }

  // ── Seleção e ações em lote ──
  const isSel = (id) => selected.has(id)
  function toggleSel(id) {
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  }
  function toggleAll(rows) {
    const ids = rows.map(a => a.id)
    const all = ids.every(id => selected.has(id))
    setSelected(prev => { const n = new Set(prev); ids.forEach(id => all ? n.delete(id) : n.add(id)); return n })
  }
  const clearSel = () => setSelected(new Set())
  const selIds = () => [...selected]
  const selAds = () => ads.filter(a => selected.has(a.id))

  async function bulk(label, fn) {
    setBulkBusy(true)
    setBulkMsg(null)
    try {
      await fn()
      setBulkMsg({ type: 'ok', msg: `${label}: ${selected.size} ${selected.size === 1 ? um : varios}.` })
      clearSel()
      await load()
    } catch (e) {
      setBulkMsg({ type: 'error', msg: e.message || 'Deu erro.' })
    }
    setBulkBusy(false)
  }

  const must = ({ error }) => { if (error) throw error }

  const bulkActive = (on) => bulk(on ? 'Ativados' : 'Desativados', async () => {
    must(await supabase.from('ads').update({ active: on }).in('id', selIds()))
  })

  const bulkDelete = () => {
    if (!window.confirm(`Apagar ${selected.size} ${selected.size === 1 ? um : varios}? Não dá pra desfazer.`)) return
    bulk('Apagados', async () => { must(await supabase.from('ads').delete().in('id', selIds())) })
  }

  const bulkCollection = () => bulk('Coleção trocada em', async () => {
    must(await supabase.from('ads').update({ collection_id: bulkCol || null }).in('id', selIds()))
  })

  const bulkPage = () => bulk('Tipo de página trocado em', async () => {
    must(await supabase.from('ads').update({ page_type: bulkPageType }).in('id', selIds()))
  })

  // Tags são listas por anúncio: cada um recebe a própria lista atualizada
  const bulkTag = (field, value, add) => bulk(add ? 'Tag adicionada em' : 'Tag removida de', async () => {
    await Promise.all(selAds().map(async a => {
      const cur = a[field] || []
      const next = add ? [...new Set([...cur, value])] : cur.filter(v => v !== value)
      if (next.length === cur.length && add === cur.includes(value)) return
      must(await supabase.from('ads').update({ [field]: next }).eq('id', a.id))
    }))
  })

  async function toggleActive(ad) {
    await supabase.from('ads').update({ active: !ad.active }).eq('id', ad.id)
    load()
  }

  // Repetido = dois cadastros do mesmo vídeo (mesmo arquivo do Drive).
  // Estar em duas coleções não é repetição: isso ganha a etiqueta "em N coleções".
  const dupInfo = useMemo(() => {
    const byFile = new Map()
    for (const a of ads) {
      const f = driveId(a.drive_url)
      if (f) byFile.set(f, (byFile.get(f) || 0) + 1)
    }
    const info = {}
    for (const a of ads) {
      const f = driveId(a.drive_url)
      const n = f ? byFile.get(f) : 0
      if (n > 1) info[a.id] = `O mesmo vídeo do Drive está cadastrado ${n} vezes`
    }
    return info
  }, [ads])
  const dupCount = Object.keys(dupInfo).length

  // Em quantas coleções cada anúncio aparece (objetivos + melhores/especial)
  const inCollections = useMemo(() => {
    const out = {}
    for (const a of ads) out[a.id] = collections.filter(c => belongsTo(a, c))
    return out
  }, [ads, collections])

  const term = search.trim().toLowerCase()
  const visible = ads.filter(a => {
    if (onlyDups && !dupInfo[a.id]) return false
    if (niche && !(a.niches || []).includes(niche)) return false
    if (media && a.media_type !== media) return false
    if (pageType && a.page_type !== pageType) return false
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
    <tr key={ad.id} className={`${!ad.active ? 'admin-table__row--inactive' : ''} ${isSel(ad.id) ? 'admin-ads__row--sel' : ''}`}>
      <td className="admin-ads__check">
        <input type="checkbox" checked={isSel(ad.id)} onChange={() => toggleSel(ad.id)} aria-label={`Selecionar ${ad.title}`} />
      </td>
      <td><CoverCheck ad={ad} /></td>
      <td className="admin-table__title">
        {ad.title}
        {dupInfo[ad.id] && <span className="admin-ads__dup" title={dupInfo[ad.id]}>repetido</span>}
        {(inCollections[ad.id] || []).length > 1 && (
          <span className="admin-ads__multi" title={inCollections[ad.id].map(c => c.title).join(' · ')}>
            em {inCollections[ad.id].length} coleções
          </span>
        )}
      </td>
      {!ehPagina && <td>{ad.collections?.title || '—'}</td>}
      <td>
        <div className="admin-table__tags">
          {ehPagina ? (
            ad.page_type ? <Tag type="teal">{PAGE_TYPE_LABELS[ad.page_type] || ad.page_type}</Tag> : <span className="admin-table__muted">—</span>
          ) : (
            <>
              {(ad.objectives || []).length === 0 && <span className="admin-table__muted">—</span>}
              {(ad.objectives || []).map(o => (
                <Tag key={o} type="teal">{OBJECTIVE_LABELS[o] || o}</Tag>
              ))}
            </>
          )}
        </div>
      </td>
      <td>
        <div className="admin-table__tags">
          {(ad.niches || []).map(n => (
            <Tag key={n}>{NICHE_LABELS[n] || n}</Tag>
          ))}
        </div>
      </td>
      <td>{(ehPagina ? PAGE_MEDIA_TYPES.find(m => m.value === ad.media_type)?.label : MEDIA_LABELS[ad.media_type]) || MEDIA_LABELS[ad.media_type] || '—'}</td>
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
          <Link to={`${base}/${ad.id}/editar`} className="admin-ads__icon" title="Editar" aria-label="Editar">
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
            <th className="admin-ads__check">
              <input
                type="checkbox"
                checked={rows.length > 0 && rows.every(a => isSel(a.id))}
                onChange={() => toggleAll(rows)}
                aria-label="Selecionar todos deste bloco"
              />
            </th>
            <th>Capa</th>
            <th>Título</th>
            {!ehPagina && <th>Coleção</th>}
            <th>{ehPagina ? 'Tipo' : 'Objetivos'}</th>
            <th>Nichos</th>
            <th>{ehPagina ? 'Formato' : 'Mídia'}</th>
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
    <div className={`admin-ads ${ehPagina ? 'admin-ads--paginas' : ''}`}>
      <div className="adm-page-header">
        <div>
          <span className="adm-eyebrow">Acervo de Anúncios</span>
          <h1>{ehPagina ? 'Páginas' : 'Anúncios'}</h1>
          <p>{ehPagina ? 'Páginas de vendas, captura, obrigado e serviço. Ficam na coleção "Páginas", num bloco próprio pra aluna.' : 'Tudo que as alunas veem nas Coleções. Desative para esconder sem apagar.'}</p>
        </div>
        <div className="adm-page-header__actions">
          <Link to={`${base}/importar`} className="adm-btn adm-btn--secondary">Importar em lote</Link>
          <Link to={`${base}/novo`} className="adm-btn adm-btn--primary">{ehPagina ? '+ Nova página' : '+ Novo anúncio'}</Link>
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
        {ehPagina ? (
          <select value={pageType} onChange={e => setPageType(e.target.value)} className="admin-select">
            <option value="">Todos os tipos de página</option>
            {PAGE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        ) : (
          <select value={selectedCollection} onChange={e => setSelectedCollection(e.target.value)} className="admin-select">
            <option value="">Todas as coleções</option>
            {collections.map(c => (
              <option key={c.id} value={c.id}>{c.is_bonus ? `Bônus — ${c.title}` : c.title}</option>
            ))}
          </select>
        )}
        <select value={niche} onChange={e => setNiche(e.target.value)} className="admin-select">
          <option value="">Todos os nichos</option>
          {(ehPagina ? PAGE_NICHES : NICHES).map(n => <option key={n.value} value={n.value}>{n.label}</option>)}
        </select>
        <select value={media} onChange={e => setMedia(e.target.value)} className="admin-select">
          <option value="">{ehPagina ? 'Todo formato' : 'Toda mídia'}</option>
          {(ehPagina ? PAGE_MEDIA_TYPES : MEDIA_TYPES).map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
        </select>
      </div>

      <div className="admin-ads__bar">
        {!ehPagina && <div className="admin-ads__view" role="group" aria-label="Como ver">
          <button type="button" className={view === 'colecoes' ? 'is-on' : ''} onClick={() => changeView('colecoes')}>Por coleção</button>
          <button type="button" className={view === 'lista' ? 'is-on' : ''} onClick={() => changeView('lista')}>Lista única</button>
        </div>}
        <button
          type="button"
          className={`admin-ads__dupbtn ${onlyDups ? 'is-on' : ''} ${dupCount ? 'has-dups' : ''}`}
          onClick={() => setOnlyDups(v => !v)}
          disabled={!dupCount}
          title={dupCount ? `${ehPagina ? 'Páginas' : 'Anúncios'} com o mesmo arquivo do Drive cadastrado mais de uma vez` : 'Nenhum arquivo cadastrado duas vezes'}
        >
          {dupCount ? `${dupCount} ${dupCount === 1 ? 'repetido' : 'repetidos'}` : 'Sem repetidos'}
        </button>
        <span className="admin-ads__count">
          {visible.length} {visible.length === 1 ? um : varios}
        </span>
      </div>

      {selected.size > 0 && (
        <div className="admin-ads__bulk">
          <div className="admin-ads__bulk-head">
            <strong>{selected.size} {selected.size === 1 ? 'selecionado' : 'selecionados'}</strong>
            <button type="button" className="admin-ads__bulk-clear" onClick={clearSel}>Limpar</button>
          </div>
          <div className="admin-ads__bulk-row">
            <button type="button" className="adm-btn adm-btn--secondary adm-btn--sm" disabled={bulkBusy} onClick={() => bulkActive(true)}>Ativar</button>
            <button type="button" className="adm-btn adm-btn--secondary adm-btn--sm" disabled={bulkBusy} onClick={() => bulkActive(false)}>Desativar</button>
            <span className="admin-ads__bulk-sep" />
            {ehPagina ? (
              <>
                <select className="admin-select" value={bulkPageType} onChange={e => setBulkPageType(e.target.value)}>
                  <option value="">Tipo de página…</option>
                  {PAGE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
                <button type="button" className="adm-btn adm-btn--secondary adm-btn--sm" disabled={bulkBusy || !bulkPageType} onClick={bulkPage}>Aplicar tipo</button>
              </>
            ) : (
              <>
                <select className="admin-select" value={bulkCol} onChange={e => setBulkCol(e.target.value)}>
                  <option value="">Coleção do mês / especial: nenhuma</option>
                  {collections.filter(c => getCollectionStyle(c.slug).kind !== 'fixa').map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
                <button type="button" className="adm-btn adm-btn--secondary adm-btn--sm" disabled={bulkBusy} onClick={bulkCollection}>Aplicar coleção</button>
                <span className="admin-ads__bulk-sep" />
                <select className="admin-select" value={bulkObj} onChange={e => setBulkObj(e.target.value)}>
                  <option value="">Objetivo…</option>
                  {Object.entries(OBJECTIVE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
                <button type="button" className="adm-btn adm-btn--secondary adm-btn--sm" disabled={bulkBusy || !bulkObj} onClick={() => bulkTag('objectives', bulkObj, true)}>+ Adicionar</button>
                <button type="button" className="adm-btn adm-btn--ghost adm-btn--sm" disabled={bulkBusy || !bulkObj} onClick={() => bulkTag('objectives', bulkObj, false)}>Remover</button>
              </>
            )}
            <span className="admin-ads__bulk-sep" />
            <select className="admin-select" value={bulkNiche} onChange={e => setBulkNiche(e.target.value)}>
              <option value="">Nicho…</option>
              {(ehPagina ? PAGE_NICHES : NICHES).map(n => <option key={n.value} value={n.value}>{n.label}</option>)}
            </select>
            <button type="button" className="adm-btn adm-btn--secondary adm-btn--sm" disabled={bulkBusy || !bulkNiche} onClick={() => bulkTag('niches', bulkNiche, true)}>+ Adicionar</button>
            <button type="button" className="adm-btn adm-btn--ghost adm-btn--sm" disabled={bulkBusy || !bulkNiche} onClick={() => bulkTag('niches', bulkNiche, false)}>Remover</button>
            <span className="admin-ads__bulk-sep" />
            <button type="button" className="adm-btn adm-btn--danger adm-btn--sm" disabled={bulkBusy} onClick={bulkDelete}>Apagar</button>
          </div>
        </div>
      )}
      {bulkMsg && <p className={`admin-ads__bulk-msg admin-ads__bulk-msg--${bulkMsg.type}`}>{bulkMsg.msg}</p>}

      {loading ? empty('Carregando…')
        : ads.length === 0 ? (
          <div className="adm-card">
            <div className="adm-empty">
              <p>{ehPagina ? 'Nenhuma página cadastrada ainda.' : 'Nenhum anúncio cadastrado ainda.'}</p>
              <Link to={`${base}/novo`} className="adm-btn adm-btn--primary" style={{ marginTop: 16 }}>{ehPagina ? 'Cadastrar a primeira' : 'Cadastrar o primeiro'}</Link>
            </div>
          </div>
        )
        : visible.length === 0 ? empty(ehPagina ? 'Nenhuma página com esses filtros.' : 'Nenhum anúncio com esses filtros.')
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
