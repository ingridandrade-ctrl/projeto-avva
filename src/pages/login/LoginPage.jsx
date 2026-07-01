import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import './LoginPage.css'

export default function LoginPage() {
  const { session, signIn, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [focused, setFocused] = useState(false)

  if (loading) return null
  if (session) return <Navigate to="/dashboard" replace />

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    const { error } = await signIn(email)
    if (error) {
      setError(
        error.code === 'email_not_found'
          ? 'Não encontramos esse email. Use o mesmo email da sua compra.'
          : 'Não foi possível entrar agora. Tente novamente em instantes.'
      )
    }
    setSubmitting(false)
  }

  return (
    <div className="login-page">
      <div className="login-page__bg">
        <div className="login-page__orb login-page__orb--1" />
        <div className="login-page__orb login-page__orb--2" />
        <div className="login-page__orb login-page__orb--3" />
        <div className="login-page__grain" />
      </div>

      <div className="login-card">
        <div className="login-card__badge">
          <span>A</span>
        </div>

        <h1 className="login-card__title">Método AVVA</h1>
        <p className="login-card__subtitle">Seja bem-vinda à sua área de membros</p>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className={`login-form__field ${focused ? 'is-focused' : ''} ${email ? 'is-filled' : ''}`}>
            <label htmlFor="email">Email de compra</label>
            <div className="login-form__input-wrap">
              <svg className="login-form__icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="3"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="seu@email.com"
                required
                autoComplete="email"
              />
            </div>
            <span className="login-form__hint">
              Use o email que você usou na compra
            </span>
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
                <span>Entrar</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </>
            )}
          </button>
        </form>

        <p className="login-card__footer">
          Acesso exclusivo para alunas do <strong>Método AVVA</strong>
        </p>
      </div>
    </div>
  )
}
