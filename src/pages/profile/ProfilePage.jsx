import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'
import './ProfilePage.css'

export default function ProfilePage() {
  const { profile, session } = useAuth()
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (profile?.name) setName(profile.name)
  }, [profile])

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setSaved(false)

    await supabase
      .from('users')
      .update({ name })
      .eq('id', session.user.id)

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="profile-page">
      <div className="profile-page__header">
        <div className="profile-page__avatar">
          <span>{name?.[0]?.toUpperCase() || profile?.email?.[0]?.toUpperCase() || '?'}</span>
        </div>
        <h1>Meu Perfil</h1>
        <p>Gerencie suas informações pessoais</p>
      </div>

      <form className="profile-form" onSubmit={handleSave}>
        <div className="profile-form__field">
          <label htmlFor="profile-name">Nome completo</label>
          <input
            id="profile-name"
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Seu nome"
          />
        </div>

        <div className="profile-form__field">
          <label>Email</label>
          <input
            type="email"
            value={profile?.email || session?.user?.email || ''}
            disabled
          />
          <span className="profile-form__hint">O email não pode ser alterado</span>
        </div>

        <div className="profile-form__actions">
          <button
            type="submit"
            className={`profile-form__save ${saved ? 'profile-form__save--saved' : ''}`}
            disabled={saving}
          >
            {saving ? 'Salvando...' : saved ? 'Salvo!' : 'Salvar alterações'}
          </button>
        </div>
      </form>
    </div>
  )
}
