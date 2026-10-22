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
            Cada coleção aparece para a aluna como uma capa vertical, no formato de tela de celular.
            Sem capa cadastrada, usamos automaticamente a miniatura do primeiro anúncio.
            As coleções por objetivo são preenchidas pelas tags de objetivo de cada anúncio (em Acervo de Anúncios → editar).
          </p>
        </div>
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
