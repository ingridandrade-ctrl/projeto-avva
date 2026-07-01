import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import Button from '../../components/ui/Button'
import './AdminAdForm.css'

const FORMATS = [
  'Talking head', 'UGC', 'POV', 'Notícia', 'Storytelling',
  'Confissão', 'Pergunta direta', 'Oferta direta', 'Escassez',
  'Quebra de objeção', 'Outro',
]

const MOMENTS = [
  { value: 'topo', label: 'Pra quem nunca te viu (topo)' },
  { value: 'meio', label: 'Pra quem já te conhece (meio)' },
  { value: 'fundo', label: 'Pra quem está quase comprando (fundo)' },
]

const MEDIA_TYPES = [
  { value: 'video', label: 'Vídeo' },
  { value: 'image', label: 'Imagem estática' },
]

export default function AdminAdForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [modules, setModules] = useState([])
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [form, setForm] = useState({
    title: '',
    module_id: '',
    subniche: '',
    format: '',
    moment: '',
    drive_url: '',
    media_type: 'video',
    analysis: '',
    active: true,
  })

  useEffect(() => {
    supabase.from('modules').select('*').order('order').then(({ data }) => {
      setModules((data || []).filter(m => m.slug !== 'kit-execucao'))
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
        module_id: data.module_id || '',
        subniche: data.subniche || '',
        format: data.format || '',
        moment: data.moment || '',
        drive_url: data.drive_url || '',
        media_type: data.media_type || 'video',
        analysis: data.analysis || '',
        active: data.active ?? true,
      })
    })
  }, [id, isEdit])

  function handleChange(field, value) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setFeedback(null)
    setSaving(true)

    const payload = {
      ...form,
      moment: form.moment || null,
      subniche: form.subniche || null,
      format: form.format || null,
    }

    let error
    if (isEdit) {
      ;({ error } = await supabase.from('ads').update(payload).eq('id', id))
    } else {
      ;({ error } = await supabase.from('ads').insert(payload))
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
          <label>Título *</label>
          <input
            type="text"
            value={form.title}
            onChange={e => handleChange('title', e.target.value)}
            required
            placeholder="Ex: UGC para academia — gancho de dor"
          />
        </div>

        <div className="admin-form__row">
          <div className="admin-form__field">
            <label>Módulo *</label>
            <select
              value={form.module_id}
              onChange={e => handleChange('module_id', e.target.value)}
              required
            >
              <option value="">Selecione...</option>
              {modules.map(m => (
                <option key={m.id} value={m.id}>{m.title}</option>
              ))}
            </select>
          </div>

          <div className="admin-form__field">
            <label>Sub-nicho *</label>
            <input
              type="text"
              value={form.subniche}
              onChange={e => handleChange('subniche', e.target.value)}
              required
              placeholder="Ex: Estética, Academia, Contabilidade"
            />
          </div>
        </div>

        <div className="admin-form__row">
          <div className="admin-form__field">
            <label>Formato *</label>
            <select
              value={form.format}
              onChange={e => handleChange('format', e.target.value)}
              required
            >
              <option value="">Selecione...</option>
              {FORMATS.map(f => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>

          <div className="admin-form__field">
            <label>Momento *</label>
            <select
              value={form.moment}
              onChange={e => handleChange('moment', e.target.value)}
              required
            >
              <option value="">Selecione...</option>
              {MOMENTS.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="admin-form__row">
          <div className="admin-form__field">
            <label>Link do Drive *</label>
            <input
              type="url"
              value={form.drive_url}
              onChange={e => handleChange('drive_url', e.target.value)}
              required
              placeholder="https://drive.google.com/file/d/..."
            />
          </div>

          <div className="admin-form__field">
            <label>Tipo de mídia *</label>
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
          <label>Análise * (por que funciona)</label>
          <textarea
            value={form.analysis}
            onChange={e => handleChange('analysis', e.target.value)}
            required
            rows={5}
            placeholder="Explique por que esse criativo funciona, quais elementos chamam atenção..."
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
