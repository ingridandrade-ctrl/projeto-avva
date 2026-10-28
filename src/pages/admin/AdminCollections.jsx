import { useEffect, useRef, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { getCollectionStyle, belongsTo } from '../../lib/catalog'
import { collectionCover } from '../../lib/drive'
import PhoneCard from '../../components/ui/PhoneCard'
import './AdminCollections.css'

// Coleções: título, subtítulo e capa (link do Drive ou imagem) com
// preview idêntico ao que a aluna vê (inclusive o fallback automático).
export default function AdminCollections() {
  const [collections, setCollections] = useState(null)
  const [ads, setAds] = useState([])
  const [drafts, setDrafts] = useState({})
  const [saving, setSaving] = useState(null)
  const [feedback, setFeedback] = useState({})
  const [uploading, setUploading] = useState(null)
  const [creating, setCreating] = useState(false)
  const [newMonth, setNewMonth] = useState(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  })
  const [createFb, setCreateFb] = useState(null)
  const fileInputs = useRef({})

  async function load() {
    const [{ data: cols }, { data: adsData }] = await Promise.all([
      supabase.from('collections').select('*').order('order'),
      supabase.from('ads').select('id, collection_id, objectives, drive_url').eq('active', true).order('created_at'),
    ])
    setCollections(cols || [])
    setAds(adsData || [])
    setDrafts(Object.fromEntries((cols || []).map(c => [c.id, { title: c.title, subtitle: c.subtitle || '', cover_url: c.cover_url || '' }])))
  }

  useEffect(() => { load() }, [])

  function edit(id, field, value) {
    setDrafts(d => ({ ...d, [id]: { ...d[id], [field]: value } }))
    setFeedback(f => ({ ...f, [id]: null }))
  }

  // Cria "Melhores de <Mês> <Ano>" com um clique. A home passa a destacar
  // automaticamente a coleção de mês mais recente.
  async function createMonth() {
    const [year, month] = newMonth.split('-').map(Number)
    if (!year || !month) return
    const names = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']
    const slugs = ['janeiro', 'fevereiro', 'marco', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']
    const name = names[month - 1]
    const slug = `melhores-de-${slugs[month - 1]}-${year}`
    if ((collections || []).some(c => c.slug === slug)) {
      setCreateFb({ type: 'error', msg: `"Melhores de ${name[0].toUpperCase() + name.slice(1)} ${year}" já existe.` })
      return
    }
    setCreating(true)
    setCreateFb(null)
    // Fica depois de todos os meses, mas antes dos especiais (ex.: Especial Black)
    const months = (collections || []).filter(c => c.slug.startsWith('melhores-'))
    const specials = (collections || []).filter(c => c.slug.startsWith('especial-'))
    const order = (months.length ? Math.max(...months.map(c => c.order)) : 6) + 1
    const { error } = await supabase.from('collections').insert({
      slug,
      title: `Melhores de ${name[0].toUpperCase() + name.slice(1)} ${year}`,
      subtitle: `Os anúncios que mais se destacaram em ${name} de ${year}`,
      order,
      is_bonus: false,
    })
    if (!error && specials.some(c => c.order <= order)) {
      // empurra os especiais para depois do novo mês
      for (const c of specials) {
        await supabase.from('collections').update({ order: c.order + 1 }).eq('id', c.id)
      }
    }
    setCreating(false)
    if (error) {
      setCreateFb({ type: 'error', msg: /policy|permission|row-level/i.test(error.message) ? 'Sem permissão: rode o arquivo supabase-migration-capas.sql no Supabase.' : error.message })
      return
    }
    setCreateFb({ type: 'ok', msg: 'Coleção criada! Agora cadastre os anúncios nela em Acervo de Anúncios → Novo anúncio.' })
    load()
  }

  async function save(col) {
    const draft = drafts[col.id]
    if (!draft?.title?.trim()) {
      setFeedback(f => ({ ...f, [col.id]: { type: 'error', msg: 'O título não pode ficar vazio.' } }))
      return
    }
    setSaving(col.id)
    const { error } = await supabase
      .from('collections')
      .update({ title: draft.title.trim(), subtitle: draft.subtitle.trim(), cover_url: draft.cover_url.trim() || null })
      .eq('id', col.id)
    setSaving(null)
    if (error) {
      const msg = /cover_url/.test(error.message)
        ? 'A coluna de capa ainda não existe: rode o arquivo supabase-migration-capas.sql no Supabase.'
        : /policy|permission|row-level/i.test(error.message)
          ? 'Sem permissão para editar: rode o arquivo supabase-migration-capas.sql no Supabase.'
          : error.message
      setFeedback(f => ({ ...f, [col.id]: { type: 'error', msg } }))
      return
    }
    setFeedback(f => ({ ...f, [col.id]: { type: 'ok', msg: 'Salvo! As alunas já veem a mudança.' } }))
    load()
  }

  // Sobe a imagem para o Storage (bucket "covers") e já salva como capa
  async function upload(col, file) {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setFeedback(f => ({ ...f, [col.id]: { type: 'error', msg: 'Escolha um arquivo de imagem (JPG, PNG ou WebP).' } }))
      return
    }
    if (file.size > 8 * 1024 * 1024) {
      setFeedback(f => ({ ...f, [col.id]: { type: 'error', msg: 'Imagem muito grande (máx. 8 MB).' } }))
      return
    }
    setUploading(col.id)
    setFeedback(f => ({ ...f, [col.id]: null }))
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg'
    const path = `${col.slug}-${Date.now()}.${ext}`
    const { error: upErr } = await supabase.storage.from('covers').upload(path, file, { upsert: true, contentType: file.type })
    if (upErr) {
      setUploading(null)
      const msg = /bucket|not found/i.test(upErr.message)
        ? 'O espaço de imagens ainda não existe: rode o arquivo supabase-migration-capas.sql no Supabase.'
        : /policy|permission|row-level|unauthorized/i.test(upErr.message)
          ? 'Sem permissão para enviar imagens: rode o arquivo supabase-migration-capas.sql no Supabase.'
          : upErr.message
      setFeedback(f => ({ ...f, [col.id]: { type: 'error', msg } }))
      return
    }
    const { data } = supabase.storage.from('covers').getPublicUrl(path)
    const url = data?.publicUrl
    const { error } = await supabase.from('collections').update({ cover_url: url }).eq('id', col.id)
    setUploading(null)
    if (error) {
      setFeedback(f => ({ ...f, [col.id]: { type: 'error', msg: error.message } }))
      return
    }
    setDrafts(d => ({ ...d, [col.id]: { ...d[col.id], cover_url: url } }))
    setFeedback(f => ({ ...f, [col.id]: { type: 'ok', msg: 'Capa enviada e salva!' } }))
    load()
  }

  async function removeCover(col) {
    setSaving(col.id)
    const { error } = await supabase.from('collections').update({ cover_url: null }).eq('id', col.id)
    setSaving(null)
    if (error) {
      setFeedback(f => ({ ...f, [col.id]: { type: 'error', msg: error.message } }))
      return
    }
    setDrafts(d => ({ ...d, [col.id]: { ...d[col.id], cover_url: '' } }))
    setFeedback(f => ({ ...f, [col.id]: { type: 'ok', msg: 'Capa removida. Voltou para a capa automática.' } }))
    load()
  }

  // Apaga a coleção. Os anúncios ligados a ela continuam no acervo, só
  // perdem o vínculo (a chave estrangeira não deixa apagar com anúncios presos).
  // As seis coleções por objetivo e o bônus são fixas e não têm esse botão.
  async function remove(col) {
    const linked = ads.filter(a => a.collection_id === col.id).length
    const msg = linked
      ? `Apagar "${col.title}"?\n\nOs ${linked} ${linked === 1 ? 'anúncio' : 'anúncios'} desta coleção continuam no acervo (nas coleções por objetivo), só deixam de aparecer aqui. Não dá pra desfazer.`
      : `Apagar "${col.title}"? Não dá pra desfazer.`
    if (!window.confirm(msg)) return
    setSaving(col.id)
    setFeedback(f => ({ ...f, [col.id]: null }))
    if (linked) {
      const { error } = await supabase.from('ads').update({ collection_id: null }).eq('collection_id', col.id)
      if (error) {
        setSaving(null)
        setFeedback(f => ({ ...f, [col.id]: { type: 'error', msg: `Não consegui desvincular os anúncios: ${error.message}` } }))
        return
      }
    }
    const { error } = await supabase.from('collections').delete().eq('id', col.id)
    setSaving(null)
    if (error) {
      setFeedback(f => ({ ...f, [col.id]: { type: 'error', msg: error.message } }))
      return
    }
    load()
  }

  function dirty(col) {
    const d = drafts[col.id]
    return d && (d.title !== col.title || d.subtitle !== (col.subtitle || '') || d.cover_url !== (col.cover_url || ''))
  }

  return (
    <div className="admin-collections">
      <div className="adm-page-header">
        <div>
          <span className="adm-eyebrow">Acervo de Anúncios</span>
          <h1>Coleções e capas</h1>
          <p>
            Cada coleção aparece para a aluna como uma capa vertical (3:4).
            Sem capa cadastrada, usamos automaticamente a miniatura do primeiro anúncio.
            As coleções por objetivo são preenchidas pelas tags de objetivo de cada anúncio (em Acervo de Anúncios → editar).
          </p>
        </div>
      </div>

      <div className="adm-card admin-collections__new">
        <div>
          <h2>Nova coleção do mês</h2>
          <p>Cria "Melhores de Mês Ano". A home das alunas passa a destacar o mês mais recente automaticamente.</p>
        </div>
        <div className="admin-collections__new-form">
          <input type="month" className="adm-input" value={newMonth} onChange={e => setNewMonth(e.target.value)} />
          <button type="button" className="adm-btn adm-btn--primary" disabled={creating} onClick={createMonth}>
            {creating ? 'Criando…' : 'Criar coleção'}
          </button>
        </div>
        {createFb && <span className={`admin-collection__fb admin-collection__fb--${createFb.type}`}>{createFb.msg}</span>}
      </div>

      {collections === null ? (
        <div className="adm-card"><p className="adm-empty">Carregando…</p></div>
      ) : (
        <div className="admin-collections__list">
          {collections.map(col => {
            const d = drafts[col.id] || {}
            const style = getCollectionStyle(col.slug)
            const preview = { ...col, cover_url: d.cover_url || null }
            const n = ads.filter(a => belongsTo(a, col)).length
            const fb = feedback[col.id]
            const kind = col.is_bonus ? 'Bônus' : style.kind === 'fixa' ? `Coleção ${String(col.order).padStart(2, '0')}` : style.kind === 'melhores' ? 'Melhores do mês' : 'Especial'
            return (
              <div key={col.id} className="adm-card admin-collection">
                <div className="admin-collection__preview">
                  <PhoneCard
                    image={collectionCover(preview, ads, 600)}
                    title={d.title || col.title}
                    kicker={kind}
                    meta={`${n} ${n === 1 ? 'anúncio' : 'anúncios'}`}
                    fallbackGradient={style.gradient}
                    fallbackLabel={col.is_bonus ? '★' : style.kind === 'fixa' ? String(col.order).padStart(2, '0') : ''}
                  />
                  <span className="admin-collection__preview-label">
                    {d.cover_url ? 'Capa cadastrada' : n > 0 ? 'Capa automática (1º anúncio)' : 'Sem capa ainda'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    ref={el => { fileInputs.current[col.id] = el }}
                    onChange={e => { upload(col, e.target.files?.[0]); e.target.value = '' }}
                  />
                  <button
                    type="button"
                    className="adm-btn adm-btn--primary admin-collection__upload"
                    disabled={uploading === col.id}
                    onClick={() => fileInputs.current[col.id]?.click()}
                  >
                    {uploading === col.id ? 'Enviando…' : d.cover_url ? 'Trocar imagem' : 'Enviar imagem'}
                  </button>
                  {col.cover_url && (
                    <button type="button" className="adm-btn adm-btn--ghost adm-btn--sm" disabled={saving === col.id} onClick={() => removeCover(col)}>
                      Remover capa
                    </button>
                  )}
                </div>

                <div className="admin-collection__form">
                  <div className="admin-collection__head">
                    <span className="adm-eyebrow">{kind} · /colecao/{col.slug}</span>
                  </div>

                  <div className="admin-form__field">
                    <label htmlFor={`t-${col.id}`}>Título</label>
                    <input id={`t-${col.id}`} type="text" value={d.title || ''} onChange={e => edit(col.id, 'title', e.target.value)} />
                  </div>

                  <div className="admin-form__field">
                    <label htmlFor={`s-${col.id}`}>Subtítulo</label>
                    <input id={`s-${col.id}`} type="text" value={d.subtitle || ''} onChange={e => edit(col.id, 'subtitle', e.target.value)} placeholder="Uma linha explicando o objetivo" />
                  </div>

                  <div className="admin-form__field">
                    <label htmlFor={`c-${col.id}`}>Ou cole um link (Drive ou imagem)</label>
                    <input
                      id={`c-${col.id}`}
                      type="url"
                      value={d.cover_url || ''}
                      onChange={e => edit(col.id, 'cover_url', e.target.value)}
                      placeholder="Cole um link do Drive ou de uma imagem vertical (1080×1920)"
                    />
                    <small className="admin-collection__hint">
                      O botão "Enviar imagem" ao lado da prévia é o jeito mais fácil. Imagem vertical (1080×1920) fica melhor.
                      Links do Drive também funcionam, desde que o arquivo esteja com acesso "Qualquer pessoa com o link".
                    </small>
                  </div>

                  <div className="admin-collection__actions">
                    <button
                      type="button"
                      className="adm-btn adm-btn--primary"
                      disabled={saving === col.id || !dirty(col)}
                      onClick={() => save(col)}
                    >
                      {saving === col.id ? 'Salvando…' : 'Salvar'}
                    </button>
                    {dirty(col) && (
                      <button
                        type="button"
                        className="adm-btn adm-btn--ghost"
                        onClick={() => setDrafts(x => ({ ...x, [col.id]: { title: col.title, subtitle: col.subtitle || '', cover_url: col.cover_url || '' } }))}
                      >
                        Desfazer
                      </button>
                    )}
                    {fb && <span className={`admin-collection__fb admin-collection__fb--${fb.type}`}>{fb.msg}</span>}
                    {style.kind !== 'fixa' && !col.is_bonus && (
                      <button
                        type="button"
                        className="adm-btn adm-btn--danger admin-collection__delete"
                        disabled={saving === col.id}
                        onClick={() => remove(col)}
                      >
                        Apagar coleção
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
