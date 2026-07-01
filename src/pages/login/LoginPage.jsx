import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import './LoginPage.css'

export default function LoginPage() {
  const { session, signIn, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [focused, setFocused] = useState(null)

  if (loading) return null
  if (session) return <Navigate to="/dashboard" replace />

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    const { error } = await signIn(email, password)
    if (error) {
      setError('Email ou senha incorretos. Verifique seus dados e tente novamente.')
    }
    setSubmitting(false)
  }

  return (
    <div className="login-page">
      {/* Left — Brand panel */}
      <div className="login-brand">
        <div className="login-brand__bg">
          <div className="login-brand__orb login-brand__orb--1" />
          <div className="login-brand__orb login-brand__orb--2" />
          <div className="login-brand__orb login-brand__orb--3" />
          <div className="login-brand__grain" />
        </div>

        <div className="login-brand__content">
          <div className="login-brand__badge">
            <span>A</span>
          </div>
          <h1 className="login-brand__title">Método AVVA</h1>
          <p className="login-brand__tagline">Sua biblioteca de criativos<br />que realmente convertem.</p>

          <div className="login-brand__features">
            <div className="login-brand__feature">
              <div className="login-brand__feature-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              </div>
              <span>+200 criativos analisados</span>
            </div>
            <div className="login-brand__feature">
              <div className="login-brand__feature-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              </div>
              <span>Ganchos e estruturas prontas</span>
            </div>
            <div className="login-brand__feature">
              <div className="login-brand__feature-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>
              </div>
              <span>Prompts de IA exclusivos</span>
            </div>
          </div>
        </div>

        <div className="login-brand__footer">
          <p>Pronta pro Digital</p>
        </div>
      </div>

      {/* Right — Form panel */}
      <div className="login-form-panel">
        <div className="login-form-panel__inner">
          <div className="login-form-panel__mobile-brand">
            <div className="login-brand__badge login-brand__badge--sm">
              <span>A</span>
            </div>
            <h1>Método AVVA</h1>
          </div>

          <div className="login-form-panel__header">
            <h2>Bem-vinda de volta</h2>
            <p>Entre na sua área de membros</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className={`login-form__field ${focused === 'email' ? 'login-form__field--focused' : ''} ${email ? 'login-form__field--filled' : ''}`}>
              <label htmlFor="email">Email</label>
              <div className="login-form__input-wrap">
                <svg className="login-form__input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="3"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onFocus={() => setFocused('email')}
                  onBlur={() => setFocused(null)}
                  placeholder="seu@email.com"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className={`login-form__field ${focused === 'password' ? 'login-form__field--focused' : ''} ${password ? 'login-form__field--filled' : ''}`}>
              <label htmlFor="password">Senha</label>
              <div className="login-form__input-wrap">
                <svg className="login-form__input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onFocus={() => setFocused('password')}
                  onBlur={() => setFocused(null)}
                  placeholder="Sua senha"
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            {error && (
              <div className="login-form__error" role="alert">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              className={`login-form__submit ${submitting ? 'login-form__submit--loading' : ''}`}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span className="login-form__spinner" />
                  <span>Entrando...</span>
                </>
              ) : (
                <>
                  <span>Acessar minha conta</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </>
              )}
            </button>

            <button type="button" className="login-form__forgot">
              Esqueceu a senha?
            </button>
          </form>

          <div className="login-form-panel__footer">
            <p>Acesso exclusivo para alunas do <strong>Pronta pro Digital</strong></p>
          </div>
        </div>
      </div>
    </div>
  )
}
