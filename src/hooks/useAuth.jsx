import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const userIdRef = useRef(null)

  // Lê o perfil da aluna. Se falhar (rede, sessão ainda se renovando, perfil
  // criado segundos depois do login), tenta de novo algumas vezes em vez de
  // deixar o portal sem nome até ela recarregar a página.
  const fetchProfile = useCallback(async (userId) => {
    for (let tentativa = 0; tentativa < 4; tentativa++) {
      if (tentativa) await new Promise(r => setTimeout(r, 1200 * tentativa))
      if (userIdRef.current !== userId) return // trocou de conta no meio
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle()
      if (userIdRef.current !== userId) return
      if (data) {
        setProfile(data)
        setLoading(false)
        return
      }
      if (error) console.warn('perfil: nova tentativa', error.message)
      setLoading(false)
    }
  }, [])

  const refreshProfile = useCallback(() => {
    if (userIdRef.current) return fetchProfile(userIdRef.current)
  }, [fetchProfile])

  useEffect(() => {
    function aplicar(session) {
      setSession(session)
      const id = session?.user?.id || null
      if (id && id !== userIdRef.current) {
        userIdRef.current = id
        // fora do callback do Supabase (consultar dentro dele pode travar o login)
        setTimeout(() => fetchProfile(id), 0)
      } else if (!id) {
        userIdRef.current = null
        setProfile(null)
        setLoading(false)
      }
    }

    supabase.auth.getSession().then(({ data: { session } }) => aplicar(session))

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Link "criar/redefinir senha" do admin: o Supabase abre o site já com a
      // sessão de recuperação; leva para a tela de definir a senha.
      if (event === 'PASSWORD_RECOVERY' && window.location.pathname !== '/admin/senha') {
        window.location.replace('/admin/senha')
        return
      }
      aplicar(session)
    })

    // Voltou pro app (outra aba, celular desbloqueado): atualiza nome e foto
    function aoVoltar() {
      if (document.visibilityState === 'visible' && userIdRef.current) fetchProfile(userIdRef.current)
    }
    document.addEventListener('visibilitychange', aoVoltar)

    return () => {
      subscription.unsubscribe()
      document.removeEventListener('visibilitychange', aoVoltar)
    }
  }, [fetchProfile])

  // Login só por email: valida o email de compra no servidor e troca
  // o token retornado por uma sessão (sem senha).
  async function signIn(email) {
    try {
      const resp = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (!resp.ok) {
        const body = await resp.json().catch(() => ({}))
        return { error: { code: body.error || 'login_failed' } }
      }

      const { token_hash } = await resp.json()
      const { error } = await supabase.auth.verifyOtp({
        type: 'email',
        token_hash,
      })
      return { error }
    } catch {
      return { error: { code: 'network_error' } }
    }
  }

  async function signOut() {
    await supabase.auth.signOut()
    userIdRef.current = null
    setSession(null)
    setProfile(null)
  }

  return (
    <AuthContext.Provider value={{ session, profile, loading, signIn, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
