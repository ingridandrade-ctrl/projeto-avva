import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import './AdminLogin.css'

// Definir / redefinir a senha da administradora. Chega aqui pelo link que o
// botão "Criar ou redefinir minha senha" manda por e-mail (sessão de recuperação).
export default function AdminSenha() {
  const { session, loading, signOut } = useAuth()
  const navigate = useNavigate()
  const [senha, setSenha] = useState('')
  const [confirma, setConfirma] = useState('')
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [esperou, setEsperou] = useState(false)

  useEffect(() => { document.title = 'AVVA Hub — Definir senha' }, [])

  // O Supabase lê o link e cria a sessão em instantes; dá um tempo antes de dizer que expirou
  useEffect(() => {
    const t = setTimeout(() => setEsperou(true), 2500)
    return () => clearTimeout(t)
  }, [])

  if (loading) return null

  if (!session) {
    if (!esperou) return null
    return (
      <div className="al">
        <div className="al__card">
          <span className="al__badge">AVVA Hub</span>
          <h1 className="al__title">Link inválido ou expirado</h1>
          <p className="al__sub">Peça um link novo na tela de login do painel.</p>
          <button className="al__btn" type="button" onClick={() => navigate('/admin/login', { replace: true })}>Ir para o login</button>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (salvando) return
    setErro('')
    if (senha.length < 8) { setErro('A senha precisa ter pelo menos 8 caracteres.'); return }
    if (senha !== confirma) { setErro('As duas senhas não são iguais.'); return }
    setSalvando(true)

    const { error } = await supabase.auth.updateUser({ password: senha })
    if (error) {
      setErro(error.message?.includes('different') ? 'Escolha uma senha diferente da anterior.' : 'Não foi possível salvar a senha. Tente de novo.')
      setSalvando(false)
      return
    }

    const { data: perfil } = await supabase.from('users').select('is_admin').eq('id', session.user.id).single()
    if (!perfil?.is_admin) {
      await signOut()
      navigate('/login', { replace: true })
      return
    }
    navigate('/admin', { replace: true })
  }

  return (
    <div className="al">
      <form className="al__card" onSubmit={handleSubmit}>
        <span className="al__badge">AVVA Hub</span>
        <h1 className="al__title">Definir senha</h1>
        <p className="al__sub">Conta: {session.user.email}. Escolha a senha do painel administrativo.</p>

        <label className="al__label" htmlFor="as-senha">Nova senha</label>
        <input
          id="as-senha"
          className="al__input"
          type="password"
          autoComplete="new-password"
          value={senha}
          onChange={e => { setSenha(e.target.value); setErro('') }}
          placeholder="pelo menos 8 caracteres"
          minLength={8}
          required
          autoFocus
        />

        <label className="al__label" htmlFor="as-confirma">Repita a senha</label>
        <input
          id="as-confirma"
          className="al__input"
          type="password"
          autoComplete="new-password"
          value={confirma}
          onChange={e => { setConfirma(e.target.value); setErro('') }}
          placeholder="••••••••"
          required
        />

        {erro && <p className="al__erro" role="alert">{erro}</p>}

        <button className="al__btn" type="submit" disabled={salvando}>
          {salvando ? 'Salvando...' : 'Salvar senha e entrar'}
        </button>
      </form>
    </div>
  )
}
