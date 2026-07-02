import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import './LoginPage.css'

const MARQUEE_ITEMS = [
  'Anúncios que vendem',
  'Coleções por objetivo',
  'Prova social',
  'Quebra de objeção',
  'Oferta direta',
  'Autoridade',
]

export default function LoginPage() {
  const { session, signIn, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

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
      <div className="login-page__noise" />

      {/* Topo */}
      <header className="login-page__top">
        <span className="login-page__brand">Método AVVA<sup>®</sup></span>
        <span className="login-page__tag">Área de membros</span>
      </header>

      {/* Centro */}
      <main className="login-page__main">
        <div className="login-page__title-block">
          <span className="login-page__eyebrow">Seja bem-vinda</span>
          <h1 className="login-page__title">
            Método<br />
            <em>AVVA</em>
          </h1>
          <p className="login-page__sub">
            Sua biblioteca de anúncios que vendem,<br />
            organizada por objetivo.
          </p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <label className="login-form__label" htmlFor="email">
            Entre com seu email de compra
          </label>
          <div className="login-form__row">
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); if (error) setError('') }}
              placeholder="seu@email.com"
              required
              autoComplete="email"
            />
            <button
              type="submit"
              className="login-form__go"
              disabled={submitting}
              aria-label="Entrar"
            >
              {submitting ? (
                <span className="login-form__spinner" />
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              )}
            </button>
          </div>

          {error && <p className="login-form__error" role="alert">{error}</p>}

          <p className="login-form__hint">
            Sem senha — o acesso é pelo email usado na compra.
          </p>
        </form>
      </main>

      {/* Marquee */}
      <div className="login-page__marquee" aria-hidden="true">
        <div className="login-page__marquee-track">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={i}>
              {item} <i>✦</i>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
