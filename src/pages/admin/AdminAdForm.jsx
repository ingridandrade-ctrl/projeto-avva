import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { NICHES, MEDIA_TYPES, OBJECTIVES, PAGE_TYPES, PAGE_MEDIA_TYPES, PAGES_SLUG } from '../../lib/catalog'
import './AdminAdForm.css'

// kind: 'anuncio' (padrão) ou 'pagina'. Página não tem objetivos nem coleção
// de origem (vai sempre pra coleção "paginas"); tem tipo de página e chega
// como print ou PDF.
export default function AdminAdForm({ kind = 'anuncio' }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)
  const ehPagina = kind === 'pagina'
  const base = ehPagina ? '/admin/produtos/acervo/paginas' : '/admin/produtos/acervo/anuncios'

  const [collections, setCollections] = useState([])
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [form, setForm] = useState({
    title: '',
    collection_id: '',
    niches: [],
    objectives: [],
    media_type: ehPagina ? 'image' : 'video',
    page_type: '',
    drive_url: '',
    analysis: '',
    active: true,
  })

  const [atualizando, setAtualizando] = useState(false)

  const buscarColecoes = () => supabase.from('collections').select('*').order('order')
    .then(({ data }) => {
      if (!data) return
      setCollections(data)
      // Página: a coleção é sempre "Páginas"; preenche sozinho quando a lista chega
      if (ehPagina) {
        const col = data.find(c => c.slug === PAGES_SLUG)
        if (col) setForm(f => (f.collection_id ? f : { ...f, collection_id: col.id }))
      }
    })

  async function carregarColecoes() {
    setAtualizando(true)
    await buscarColecoes()
    setAtualizando(false)
  }

  // Busca as coleções ao abrir e de novo sempre que a aba volta a ficar visível:
  // assim uma coleção criada em outra aba aparece aqui sem recarregar a página.
  useEffect(() => {
    buscarColecoes()
    const aoVoltar = () => { if (document.visibilityState === 'visible') buscarColecoes() }
    document.addEventListener('visibilitychange', aoVoltar)
    window.addEventListener('focus', aoVoltar)
    return () => {
      document.removeEventListener('visibilitychange', aoVoltar)
      window.removeEventListener('focus', aoVoltar)
    }
  }, [])

  useEffect(() => {
    if (!isEdit) return
    supabase.from('ads').select('*').eq('id', id).single().then(({ data, error }) => {
      if (error || !data) {
        setFeedback({ type: 'error', msg: 'Anúncio não encontrado.' })
        return
      }
      setForm({
        title: data.title || '',
        collection_id: data.collection_id || '',
        niches: data.niches || [],
        objectives: data.objectives || [],
        media_type: data.media_type || (ehPagina ? 'image' : 'video'),
        page_type: data.page_type || '',
        drive_url: data.drive_url || '',
        analysis: data.analysis || '',
        active: data.active ?? true,
      })
    })
  }, [id, isEdit, ehPagina])


  function handleChange(field, value) {
    setForm(f => ({ ...f, [field]: value }))
  }

  function toggleObjective(value) {
    setForm(f => ({
      ...f,
      objectives: f.objectives.includes(value)
        ? f.objectives.filter(o => o !== value)
        : [...f.objectives, value],
    }))
  }

  function toggleNiche(value) {
    setForm(f => ({
      ...f,
      niches: f.niches.includes(value)
        ? f.niches.filter(n => n !== value)
        : [...f.niches, value],
    }))
  }

  async function save({ stayForNext = false } = {}) {
    setFeedback(null)

    if (!form.title || !form.collection_id || !form.drive_url || !form.analysis) {
      setFeedback({ type: 'error', msg: ehPagina && !form.collection_id ? 'A coleção "Páginas" ainda não existe no banco: rode a migração supabase-migration-paginas.sql.' : 'Preencha todos os campos obrigatórios.' })
      return
    }

    if (ehPagina && !form.page_type) {
      setFeedback({ type: 'error', msg: 'Escolha o tipo da página.' })
      return
    }

    if (form.niches.length === 0) {
      setFeedback({ type: 'error', msg: 'Marque pelo menos um nicho.' })
      return
    }

    setSaving(true)

    const row = { ...form, kind, page_type: ehPagina ? form.page_type : null, objectives: ehPagina ? [] : form.objectives }
    let error
    if (isEdit) {
      ;({ error } = await supabase.from('ads').update(row).eq('id', id))
    } else {
      ;({ error } = await supabase.from('ads').insert(row))
    }

    setSaving(false)

    if (error) {
      setFeedback({ type: 'error', msg: `Erro: ${error.message}` })
      return
    }

    const nome = ehPagina ? 'Página' : 'Anúncio'
    if (isEdit) {
      setFeedback({ type: 'success', msg: `${nome} ${ehPagina ? 'atualizada' : 'atualizado'}!` })
    } else if (stayForNext) {
      // Mantém coleção e nichos para cadastrar o próximo em sequência
      setForm(f => ({ ...f, title: '', drive_url: '', analysis: '' }))
      setFeedback({ type: 'success', msg: `${nome} ${ehPagina ? 'criada' : 'criado'}! Pode cadastrar ${ehPagina ? 'a próxima' : 'o próximo'}.` })
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      setFeedback({ type: 'success', msg: `${nome} ${ehPagina ? 'criada' : 'criado'}!` })
      setTimeout(() => navigate(base), 1000)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    await save()
  }

  return (
    <div className="admin-ad-form">
      <Link to={base} className="admin-ad-form__back">← Voltar para {ehPagina ? 'páginas' : 'anúncios'}</Link>
      <div className="adm-page-header">
        <div>
          <span className="adm-eyebrow">Acervo de Anúncios</span>
          <h1>{ehPagina ? (isEdit ? 'Editar página' : 'Nova página') : (isEdit ? 'Editar anúncio' : 'Novo anúncio')}</h1>
          <p>{isEdit ? 'As alterações aparecem na hora para as alunas.' : ehPagina ? 'Suba o print longo (ou o PDF) da página no Drive e cole o link. Nicho aceita mais de um.' : 'Preencha os campos. Nichos e objetivos aceitam mais de um.'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="admin-form">
        <div className="admin-form__field">
          <label>Título <span className="admin-form__required">*</span></label>
          <input
            type="text"
            value={form.title}
            onChange={e => handleChange('title', e.target.value)}
            required
            placeholder={ehPagina ? 'Ex: Página de vendas — curso de confeitaria' : 'Ex: Depoimento de cliente — academia'}
          />
        </div>

        {ehPagina && (
          <div className="admin-form__field">
            <label>Tipo de página <span className="admin-form__required">*</span></label>
            <div className="admin-form__checks">
              {PAGE_TYPES.map(t => (
                <label key={t.value} className={`admin-form__check ${form.page_type === t.value ? 'admin-form__check--on' : ''}`} title={t.hint}>
                  <input
                    type="radio"
                    name="page_type"
                    checked={form.page_type === t.value}
                    onChange={() => handleChange('page_type', t.value)}
                  />
                  {t.label}
                </label>
              ))}
            </div>
            <small className="admin-form__hint">{PAGE_TYPES.find(t => t.value === form.page_type)?.hint || 'A aluna filtra as páginas por esse tipo.'}</small>
          </div>
        )}

        <div className="admin-form__row">
          {!ehPagina && <div className="admin-form__field">
            <label>Coleção <span className="admin-form__required">*</span></label>
            <select
              value={form.collection_id}
              onChange={e => handleChange('collection_id', e.target.value)}
              required
            >
              <option value="">Selecione...</option>
              {collections.map(c => (
                <option key={c.id} value={c.id}>
                  {c.is_bonus ? `Bônus — ${c.title}` : c.title}
                </option>
              ))}
            </select>
            <small className="admin-form__hint">
              Não achou a coleção?{' '}
              <button type="button" className="admin-form__linkbtn" onClick={carregarColecoes} disabled={atualizando}>
                {atualizando ? 'Atualizando…' : 'Atualizar lista'}
              </button>
              {' · '}
              <Link to="/admin/produtos/acervo/colecoes" target="_blank">Criar coleção</Link>
            </small>
          </div>}

          <div className="admin-form__field">
            <label>{ehPagina ? 'Formato' : 'Tipo de mídia'} <span className="admin-form__required">*</span></label>
            <select
              value={form.media_type}
              onChange={e => handleChange('media_type', e.target.value)}
              required
            >
              {(ehPagina ? PAGE_MEDIA_TYPES : MEDIA_TYPES).map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
        </div>

        {!ehPagina && <div className="admin-form__field">
          <label>Objetivos (coleções por objetivo — pode marcar vários)</label>
          <div className="admin-form__checks">
            {OBJECTIVES.map(o => (
              <label key={o.value} className={`admin-form__check ${form.objectives.includes(o.value) ? 'admin-form__check--on' : ''}`} title={o.hint}>
                <input
                  type="checkbox"
                  checked={form.objectives.includes(o.value)}
                  onChange={() => toggleObjective(o.value)}
                />
                {o.label}
              </label>
            ))}
          </div>
          <small className="admin-form__hint">O anúncio continua na coleção de origem (ex.: Melhores de Setembro) e aparece também em cada objetivo marcado.</small>
        </div>}

        <div className="admin-form__field">
          <label>Nichos <span className="admin-form__required">*</span> (pode marcar vários)</label>
          <div className="admin-form__checks">
            {NICHES.map(n => (
              <label key={n.value} className={`admin-form__check ${form.niches.includes(n.value) ? 'admin-form__check--on' : ''}`}>
                <input
                  type="checkbox"
                  checked={form.niches.includes(n.value)}
                  onChange={() => toggleNiche(n.value)}
                />
                {n.label}
              </label>
            ))}
          </div>
        </div>

        <div className="admin-form__field">
          <label>Link do Drive <span className="admin-form__required">*</span></label>
          <input
            type="url"
            value={form.drive_url}
            onChange={e => handleChange('drive_url', e.target.value)}
            required
            placeholder="https://drive.google.com/file/d/..."
          />
        </div>

        {form.drive_url && form.drive_url.includes('drive.google.com') && (
          <div className="admin-form__preview">
            <label>Preview do arquivo</label>
            <div className="admin-form__preview-frame">
              <iframe
                src={`https://drive.google.com/file/d/${form.drive_url.match(/\/d\/([a-zA-Z0-9_-]+)/)?.[1]}/preview`}
                width="100%"
                height="200"
                allow="autoplay"
                title="Preview"
              />
            </div>
          </div>
        )}

        <div className="admin-form__field">
          <label>Análise <span className="admin-form__required">*</span> (por que funciona)</label>
          <textarea
            value={form.analysis}
            onChange={e => handleChange('analysis', e.target.value)}
            required
            rows={5}
            placeholder={ehPagina ? 'Explique por que essa página converte: a ordem dos blocos, a promessa, a prova, a oferta, a chamada...' : 'Explique por que esse anúncio funciona, quais elementos chamam atenção...'}
          />
        </div>

        <div className="admin-form__field admin-form__field--inline">
          <label>
            <input
              type="checkbox"
              checked={form.active}
              onChange={e => handleChange('active', e.target.checked)}
            />
            Ativo (visível na área de membros)
          </label>
        </div>

        {feedback && (
          <div className={`admin-form__feedback admin-form__feedback--${feedback.type}`}>
            {feedback.msg}
          </div>
        )}

        <div className="admin-form__actions">
          <button type="submit" className="adm-btn adm-btn--primary" disabled={saving}>
            {saving ? 'Salvando...' : isEdit ? 'Salvar alterações' : ehPagina ? 'Criar página' : 'Criar anúncio'}
          </button>
          {!isEdit && (
            <button
              type="button"
              className="adm-btn adm-btn--secondary"
              disabled={saving}
              onClick={() => save({ stayForNext: true })}
            >
              {ehPagina ? 'Salvar e criar próxima' : 'Salvar e criar próximo'}
            </button>
          )}
          <button type="button" className="adm-btn adm-btn--ghost" onClick={() => navigate(base)}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}
