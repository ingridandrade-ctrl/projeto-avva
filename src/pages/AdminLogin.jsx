import { useState, useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import './AdminLogin.css'

export default function AdminLogin() {
  const { session, profile, loading, signOut } = useAuth()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)

  useEffect(() => { document.title = 'Mentoria Avva — Acesso' }, [])

  useEffect(() => {
    if (session && profile && !profile.is_admin) {
      setErro('Esta conta não tem acesso ao dashboard.')
      signOut()
    }
  }, [session, profile])

  if (loading) return null
  if (session && profile?.is_admin) {
    return <Navigate to={location.state?.from || '/aplicacao/dashboard'} replace />
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (enviando) return
    setErro('')
    setEnviando(true)
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: senha })
    if (error) {
      setErro(error.message === 'Invalid login credentials'
        ? 'E-mail ou senha incorretos.'
        : 'Não foi possível entrar agora. Tente novamente.')
      setEnviando(false)
    }
  }

  return (
    <div className="al">
      <form className="al__card" onSubmit={handleSubmit}>
        <span className="al__badge">Mentoria Avva</span>
        <h1 className="al__title">Acesso ao dashboard</h1>
        <p className="al__sub">Entre com seu e-mail e senha de administradora.</p>

        <label className="al__label" htmlFor="al-email">E-mail</label>
        <input
          id="al-email"
          className="al__input"
          type="email"
          autoComplete="username"
          value={email}
          onChange={e => { setEmail(e.target.value); setErro('') }}
          placeholder="voce@email.com"
          required
          autoFocus
        />

        <label className="al__label" htmlFor="al-senha">Senha</label>
        <input
          id="al-senha"
          className="al__input"
          type="password"
          autoComplete="current-password"
          value={senha}
          onChange={e => { setSenha(e.target.value); setErro('') }}
          placeholder="••••••••"
          required
        />

        {erro && <p className="al__erro" role="alert">{erro}</p>}

        <button className="al__btn" type="submit" disabled={enviando}>
          {enviando ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  )
}
