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
  const [aviso, setAviso] = useState('')

  useEffect(() => { document.title = 'Método AVVA — Painel' }, [])

  if (loading) return null
  if (session && profile?.is_admin) {
    return <Navigate to={location.state?.from || '/admin'} replace />
  }
  const semAcesso = session && !profile?.is_admin

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (enviando) return
    setErro('')
    setEnviando(true)

    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: senha })
    if (error) {
      setErro(error.message === 'Invalid login credentials'
        ? 'E-mail ou senha incorretos.'
        : 'Não foi possível entrar agora. Tente novamente.')
      setEnviando(false)
      return
    }

    const { data: perfil } = await supabase.from('users').select('is_admin').eq('id', data.user.id).single()
    if (!perfil?.is_admin) {
      await signOut()
      setErro('Esta conta não tem acesso ao dashboard.')
      setEnviando(false)
    }
  }

  // Envia o link de criar/redefinir senha para o e-mail digitado
  const handleSenha = async () => {
    const mail = email.trim()
    if (!mail) { setErro('Digite seu e-mail primeiro.'); return }
    if (enviando) return
    setErro(''); setAviso(''); setEnviando(true)
    const { error } = await supabase.auth.resetPasswordForEmail(mail, {
      redirectTo: `${window.location.origin}/admin/senha`,
    })
    setEnviando(false)
    if (error) { setErro('Não foi possível enviar o link agora. Tente de novo em instantes.'); return }
    setAviso(`Se ${mail} for uma conta de administradora, você recebe um link por e-mail para definir a senha.`)
  }

  return (
    <div className="al">
      <form className="al__card" onSubmit={handleSubmit}>
        <span className="al__badge">Método AVVA</span>
        <h1 className="al__title">Painel administrativo</h1>
        <p className="al__sub">Entre com seu e-mail e senha de administradora.</p>

        {semAcesso && (
          <p className="al__erro" role="alert">
            Você está logada como {session.user.email}, mas essa conta não tem acesso ao dashboard.{' '}
            <button type="button" className="al__link" onClick={signOut}>Sair dessa conta</button>
          </p>
        )}

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
        {aviso && <p className="al__aviso" role="status">{aviso}</p>}

        <button className="al__btn" type="submit" disabled={enviando}>
          {enviando ? 'Entrando...' : 'Entrar'}
        </button>

        <button type="button" className="al__link al__link--rodape" onClick={handleSenha} disabled={enviando}>
          Criar ou redefinir minha senha
        </button>
      </form>
    </div>
  )
}
