import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { NICHES, MEDIA_TYPES } from '../../lib/catalog'
import Button from '../../components/ui/Button'
import './AdminAdForm.css'

export default function AdminAdForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [collections, setCollections] = useState([])
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [form, setForm] = useState({
    title: '',
    collection_id: '',
    niches: [],
    media_type: 'video',
    drive_url: '',
    analysis: '',
    active: true,
  })

  useEffect(() => {
    supabase.from('collections').select('*').order('order').then(({ data }) => {
      setCollections(data || [])
    })
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
        media_type: data.media_type || 'video',
        drive_url: data.drive_url || '',
        analysis: data.analysis || '',
        active: data.active ?? true,
      })
    })
  }, [id, isEdit])

  function handleChange(field, value) {
    setForm(f => ({ ...f, [field]: value }))
  }

  function toggleNiche(value) {
    setForm(f => ({
      ...f,
      niches: f.niches.includes(value)
        ? f.niches.filter(n => n !== value)
        : [...f.niches, value],
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setFeedback(null)

    if (form.niches.length === 0) {
      setFeedback({ type: 'error', msg: 'Marque pelo menos um nicho.' })
      return
    }

    setSaving(true)

    let error
    if (isEdit) {
      ;({ error } = await supabase.from('ads').update(form).eq('id', id))
    } else {
      ;({ error } = await supabase.from('ads').insert(form))
    }

    setSaving(false)

    if (error) {
      setFeedback({ type: 'error', msg: `Erro: ${error.message}` })
    } else {
      setFeedback({ type: 'success', msg: isEdit ? 'Anúncio atualizado!' : 'Anúncio criado!' })
      if (!isEdit) {
        setTimeout(() => navigate('/admin/ads'), 1000)
      }
    }
  }

  return (
    <div className="admin-ad-form">
      <h1>{isEdit ? 'Editar anúncio' : 'Novo anúncio'}</h1>

      <form onSubmit={handleSubmit} className="admin-form">
        <div className="admin-form__field">
          <label>Título <span className="admin-form__required">*</span></label>
          <input
            type="text"
            value={form.title}
            onChange={e => handleChange('title', e.target.value)}
            required
            placeholder="Ex: Depoimento de cliente — academia"
          />
        </div>

        <div className="admin-form__row">
          <div className="admin-form__field">
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
          </div>

          <div className="admin-form__field">
            <label>Tipo de mídia <span className="admin-form__required">*</span></label>
            <select
              value={form.media_type}
              onChange={e => handleChange('media_type', e.target.value)}
              required
            >
              {MEDIA_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
        </div>

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
            placeholder="Explique por que esse anúncio funciona, quais elementos chamam atenção..."
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
          <Button type="submit" disabled={saving}>
            {saving ? 'Salvando...' : isEdit ? 'Salvar alterações' : 'Criar anúncio'}
          </Button>
          <Button type="button" variant="ghost" onClick={() => navigate('/admin/ads')}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  )
}
