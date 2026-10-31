import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'
import { comprimirImagem, extensao } from '../../lib/imagem'
import Avatar from '../../components/ui/Avatar'
import './ProfilePage.css'

const LIMITE_FOTO = 1024 * 1024 // 1 MB

export default function ProfilePage() {
  const { profile, session, refreshProfile } = useAuth()
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [erro, setErro] = useState('')
  const [foto, setFoto] = useState({ estado: 'idle', msg: '' }) // idle | enviando | erro | ok
  const arquivo = useRef(null)

  useEffect(() => {
    if (profile?.name) setName(profile.name) // eslint-disable-line react-hooks/set-state-in-effect
  }, [profile])

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setSaved(false)
    setErro('')

    const { error } = await supabase
      .from('users')
      .update({ name: name.trim() })
      .eq('id', session.user.id)

    setSaving(false)
    if (error) { setErro('Não consegui salvar agora. Tenta de novo?'); return }
    await refreshProfile?.() // nome novo já aparece no cabeçalho e no menu
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  async function enviarFoto(file) {
    if (!file) return
    if (!file.type.startsWith('image/')) { setFoto({ estado: 'erro', msg: 'Escolha uma foto (JPG, PNG ou HEIC).' }); return }
    if (file.size > 25 * 1024 * 1024) { setFoto({ estado: 'erro', msg: 'Foto muito grande (máx. 25 MB).' }); return }
    setFoto({ estado: 'enviando', msg: '' })

    // Foto de perfil é pequena na tela: 400px já fica nítida e leve
    let leve = file
    try { leve = await comprimirImagem(file, { maxLado: 400, qualidade: 0.85 }) } catch { /* sobe a original */ }
    // Limite de 1 MB por foto (o banco também recusa acima disso)
    if (leve.size > LIMITE_FOTO) {
      setFoto({ estado: 'erro', msg: 'Essa foto ficou maior que 1 MB. Tenta outra, ou um print dela.' })
      return
    }
    const uid = session.user.id
    const ext = leve === file ? ((file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg') : extensao(leve)
    const path = `${uid}/${Date.now()}.${ext}`

    const { error: upErr } = await supabase.storage.from('avatars').upload(path, leve, { contentType: leve.type || file.type, cacheControl: '31536000' })
    if (upErr) {
      console.error('foto: upload', upErr)
      setFoto({ estado: 'erro', msg: 'Não consegui enviar a foto agora. Tenta de novo daqui a pouco.' })
      return
    }
    const url = supabase.storage.from('avatars').getPublicUrl(path).data?.publicUrl
    const { error } = await supabase.from('users').update({ avatar_url: url }).eq('id', uid)
    if (error) {
      console.error('foto: perfil', error)
      setFoto({ estado: 'erro', msg: 'A foto subiu, mas não consegui salvar no perfil. Tenta de novo?' })
      return
    }
    // apaga a foto anterior, se era daqui
    const antiga = profile?.avatar_url?.split('/avatars/')[1]
    if (antiga) supabase.storage.from('avatars').remove([decodeURIComponent(antiga)])
    await refreshProfile?.()
    setFoto({ estado: 'ok', msg: 'Foto atualizada!' })
    setTimeout(() => setFoto({ estado: 'idle', msg: '' }), 3000)
  }

  async function removerFoto() {
    setFoto({ estado: 'enviando', msg: '' })
    const { error } = await supabase.from('users').update({ avatar_url: null }).eq('id', session.user.id)
    if (error) { setFoto({ estado: 'erro', msg: 'Não consegui remover agora. Tenta de novo?' }); return }
    const antiga = profile?.avatar_url?.split('/avatars/')[1]
    if (antiga) supabase.storage.from('avatars').remove([decodeURIComponent(antiga)])
    await refreshProfile?.()
    setFoto({ estado: 'idle', msg: '' })
  }

  const temFoto = Boolean(profile?.avatar_url)

  return (
    <div className="profile-page">
      <div className="profile-page__header">
        <div className="profile-page__foto">
          <button
            type="button"
            className="profile-page__avatar"
            onClick={() => arquivo.current?.click()}
            disabled={foto.estado === 'enviando'}
            aria-label={temFoto ? 'Trocar foto' : 'Colocar foto'}
          >
            <span><Avatar profile={profile ? { ...profile, name: name || profile.name } : null} /></span>
            <i className="profile-page__camera" aria-hidden="true">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
            </i>
          </button>
          <div className="profile-page__foto-acoes">
            <button type="button" className="profile-page__foto-btn" onClick={() => arquivo.current?.click()} disabled={foto.estado === 'enviando'}>
              {foto.estado === 'enviando' ? 'Enviando…' : temFoto ? 'Trocar foto' : 'Colocar uma foto'}
            </button>
            {temFoto && foto.estado !== 'enviando' && (
              <button type="button" className="profile-page__foto-btn profile-page__foto-btn--sec" onClick={removerFoto}>Remover</button>
            )}
            <small className={`profile-page__foto-msg ${foto.estado === 'erro' ? 'is-erro' : ''}`}>
              {foto.msg || 'Opcional. Aparece no topo do portal.'}
            </small>
          </div>
          <input
            ref={arquivo}
            type="file"
            accept="image/*"
            hidden
            onChange={e => { enviarFoto(e.target.files?.[0]); e.target.value = '' }}
          />
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

        {erro && <p className="profile-form__hint" style={{ color: '#b3412b' }}>{erro}</p>}

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
