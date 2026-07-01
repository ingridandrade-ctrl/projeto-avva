import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import Button from '../../components/ui/Button'
import './AdminKit.css'

const TYPES = [
  { value: 'gancho', label: 'Ganchos' },
  { value: 'narrativa', label: 'Estruturas narrativas' },
  { value: 'angulo', label: 'Ângulos de copy' },
]

const MOMENTS = [
  { value: 'topo', label: 'Topo de funil' },
  { value: 'meio', label: 'Meio de funil' },
  { value: 'fundo', label: 'Fundo de funil' },
]

const EMPTY_FORM = {
  type: 'gancho',
  title: '',
  description: '',
  example: '',
  prompt: '',
  moment: '',
  phrases: '',
  active: true,
}

export default function AdminKit() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [feedback, setFeedback] = useState(null)
  const [saving, setSaving] = useState(false)

  async function loadItems() {
    const { data } = await supabase
      .from('kit_items')
      .select('*')
      .order('created_at')
    setItems(data || [])
    setLoading(false)
  }

  useEffect(() => { loadItems() }, [])

  function startNew(type) {
    setEditing(null)
    setForm({ ...EMPTY_FORM, type })
    setFeedback(null)
  }

  function startEdit(item) {
    setEditing(item.id)
    setForm({
      type: item.type,
      title: item.title || '',
      description: item.description || '',
      example: item.example || '',
      prompt: item.prompt || '',
      moment: item.moment || '',
      phrases: (item.phrases || []).join('\n'),
      active: item.active ?? true,
    })
    setFeedback(null)
  }

  function cancelForm() {
    setEditing(null)
    setForm({ ...EMPTY_FORM })
    setFeedback(null)
  }

  function handleChange(field, value) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setFeedback(null)

    const payload = {
      type: form.type,
      title: form.title,
      description: form.description || null,
      example: form.example || null,
      prompt: form.prompt || null,
      moment: form.type === 'angulo' && form.moment ? form.moment : null,
      phrases: form.type === 'angulo' && form.phrases.trim()
        ? form.phrases.split('\n').map(s => s.trim()).filter(Boolean)
        : null,
      active: form.active,
    }

    let error
    if (editing) {
      ;({ error } = await supabase.from('kit_items').update(payload).eq('id', editing))
    } else {
      ;({ error } = await supabase.from('kit_items').insert(payload))
    }

    setSaving(false)

    if (error) {
      setFeedback({ type: 'error', msg: error.message })
    } else {
      setFeedback({ type: 'success', msg: editing ? 'Atualizado!' : 'Criado!' })
      setEditing(null)
      setForm({ ...EMPTY_FORM })
      loadItems()
    }
  }

  async function handleDelete(item) {
    if (!window.confirm(`Deletar "${item.title}"?`)) return
    await supabase.from('kit_items').delete().eq('id', item.id)
    if (editing === item.id) cancelForm()
    loadItems()
  }

  async function toggleActive(item) {
    await supabase.from('kit_items').update({ active: !item.active }).eq('id', item.id)
    loadItems()
  }

  function renderSection(type, label) {
    const sectionItems = items.filter(i => i.type === type)
    return (
      <section className="admin-kit__section">
        <div className="admin-kit__section-header">
          <h2>{label}</h2>
          <Button size="sm" onClick={() => startNew(type)}>+ Novo</Button>
        </div>

        {sectionItems.length === 0 ? (
          <p className="admin-kit__empty">Nenhum item cadastrado.</p>
        ) : (
          <div className="admin-kit__items">
            {sectionItems.map(item => (
              <div
                key={item.id}
                className={`admin-kit__item ${!item.active ? 'admin-kit__item--inactive' : ''}`}
              >
                <div className="admin-kit__item-info">
                  <strong>{item.title}</strong>
                  {item.description && <p>{item.description}</p>}
                  {item.moment && (
                    <span className="admin-kit__moment">
                      {MOMENTS.find(m => m.value === item.moment)?.label || item.moment}
                    </span>
                  )}
                </div>
                <div className="admin-kit__item-actions">
                  <button
                    className={`admin-toggle ${item.active ? 'admin-toggle--on' : ''}`}
                    onClick={() => toggleActive(item)}
                  >
                    <span className="admin-toggle__knob" />
                  </button>
                  <button className="admin-btn-sm" onClick={() => startEdit(item)}>
                    Editar
                  </button>
                  <button
                    className="admin-btn-sm admin-btn-sm--danger"
                    onClick={() => handleDelete(item)}
                  >
                    Deletar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    )
  }

  if (loading) return <p>Carregando...</p>

  return (
    <div className="admin-kit">
      <h1>Kit de Execução</h1>

      {(editing !== null || form.title || form.type !== 'gancho') && (
        <form onSubmit={handleSubmit} className="admin-form admin-kit__form">
          <h3>{editing ? 'Editar item' : `Novo ${TYPES.find(t => t.value === form.type)?.label?.slice(0, -1) || 'item'}`}</h3>

          {!editing && (
            <div className="admin-form__field">
              <label>Tipo</label>
              <select value={form.type} onChange={e => handleChange('type', e.target.value)}>
                {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          )}

          <div className="admin-form__field">
            <label>Título *</label>
            <input
              type="text"
              value={form.title}
              onChange={e => handleChange('title', e.target.value)}
              required
            />
          </div>

          <div className="admin-form__field">
            <label>Descrição</label>
            <textarea
              value={form.description}
              onChange={e => handleChange('description', e.target.value)}
              rows={2}
            />
          </div>

          <div className="admin-form__field">
            <label>Exemplo</label>
            <textarea
              value={form.example}
              onChange={e => handleChange('example', e.target.value)}
              rows={3}
            />
          </div>

          <div className="admin-form__field">
            <label>Prompt de IA</label>
            <textarea
              value={form.prompt}
              onChange={e => handleChange('prompt', e.target.value)}
              rows={3}
            />
          </div>

          {form.type === 'angulo' && (
            <>
              <div className="admin-form__field">
                <label>Momento</label>
                <select value={form.moment} onChange={e => handleChange('moment', e.target.value)}>
                  <option value="">Nenhum</option>
                  {MOMENTS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
              </div>

              <div className="admin-form__field">
                <label>Frases prontas (uma por linha)</label>
                <textarea
                  value={form.phrases}
                  onChange={e => handleChange('phrases', e.target.value)}
                  rows={4}
                  placeholder="Uma frase por linha..."
                />
              </div>
            </>
          )}

          <div className="admin-form__field admin-form__field--inline">
            <label>
              <input
                type="checkbox"
                checked={form.active}
                onChange={e => handleChange('active', e.target.checked)}
              />
              Ativo
            </label>
          </div>

          {feedback && (
            <div className={`admin-form__feedback admin-form__feedback--${feedback.type}`}>
              {feedback.msg}
            </div>
          )}

          <div className="admin-form__actions">
            <Button type="submit" disabled={saving}>
              {saving ? 'Salvando...' : editing ? 'Salvar' : 'Criar'}
            </Button>
            <Button type="button" variant="ghost" onClick={cancelForm}>Cancelar</Button>
          </div>
        </form>
      )}

      {renderSection('gancho', 'Ganchos')}
      {renderSection('narrativa', 'Estruturas narrativas')}
      {renderSection('angulo', 'Ângulos de copy')}
    </div>
  )
}
