import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLocation } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import './SuggestionBox.css'

// Caixinha de sugestões: faixa clara e discreta dentro do produto. O botão abre
// um pop-up com o campo de texto. Vai para a tabela "sugestoes".
export default function SuggestionBox() {
  const [aberto, setAberto] = useState(false)

  return (
    <>
      <section className="sugestoes" aria-label="Caixinha de sugestões">
        <span className="sugestoes__icone" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </span>
        <div className="sugestoes__texto">
          <span className="sugestoes__kicker">Caixinha de sugestões</span>
          <p><strong>O Acervo é um projeto vivo, e estamos aqui pra te ouvir.</strong> Sentiu falta de algo? Conta pra gente.</p>
        </div>
        <button type="button" className="sugestoes__abrir" onClick={() => setAberto(true)}>
          Deixar sugestão
        </button>
      </section>

      {aberto && <SuggestionModal onClose={() => setAberto(false)} />}
    </>
  )
}

function SuggestionModal({ onClose }) {
  const { session, profile } = useAuth()
  const location = useLocation()
  const [texto, setTexto] = useState('')
  const [estado, setEstado] = useState('idle') // idle | enviando | enviado | erro
  const campo = useRef(null)

  useEffect(() => {
    campo.current?.focus()
    function onKey(e) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    // iOS ignora overflow:hidden; fixar o body evita a página de trás rolar
    const scrollY = window.scrollY
    const body = document.body
    const prev = { overflow: body.style.overflow, position: body.style.position, top: body.style.top, width: body.style.width }
    body.style.overflow = 'hidden'
    body.style.position = 'fixed'
    body.style.top = `-${scrollY}px`
    body.style.width = '100%'
    return () => {
      document.removeEventListener('keydown', onKey)
      Object.assign(body.style, prev)
      window.scrollTo(0, scrollY)
    }
  }, [onClose])

  async function enviar(e) {
    e.preventDefault()
    const t = texto.trim()
    if (!t || !session) return
    setEstado('enviando')
    const { error } = await supabase.from('sugestoes').insert({
      user_id: session.user.id,
      email: session.user.email,
      name: profile?.name || null,
      tipo: 'sugestao',
      texto: t,
      pagina: location.pathname,
    })
    if (error) { setEstado('erro'); return }
    setEstado('enviado')
    setTexto('')
  }

  return createPortal(
    <div className="sug-modal" onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="sug-modal__panel" role="dialog" aria-modal="true" aria-labelledby="sug-modal-titulo">
        <button type="button" className="sug-modal__fechar" onClick={onClose} aria-label="Fechar">×</button>

        {estado === 'enviado' ? (
          <div className="sug-modal__ok">
            <span className="sugestoes__kicker">Caixinha de sugestões</span>
            <h2 id="sug-modal-titulo">Recebemos. Obrigada!</h2>
            <p>Vai direto pra mesa de quem monta o Acervo.</p>
            <div className="sug-modal__acoes">
              <button type="button" className="sug-modal__secundario" onClick={() => setEstado('idle')}>Mandar outra</button>
              <button type="button" className="sug-modal__enviar" onClick={onClose}>Fechar</button>
            </div>
          </div>
        ) : (
          <form onSubmit={enviar}>
            <span className="sugestoes__kicker">Caixinha de sugestões</span>
            <h2 id="sug-modal-titulo">O Acervo é um projeto vivo, e estamos aqui pra te ouvir.</h2>
            <p>Sentiu falta de algo? Quer uma curadoria? Conta o que você quer ver nas próximas atualizações.</p>
            <textarea
              ref={campo}
              value={texto}
              onChange={e => setTexto(e.target.value)}
              placeholder="Ex.: queria ver mais anúncios de negócio local…"
              rows={5}
              maxLength={2000}
              required
              aria-label="Sua sugestão"
            />
            {estado === 'erro' && <span className="sug-modal__erro">Não foi dessa vez. Tenta de novo?</span>}
            <div className="sug-modal__acoes">
              <button type="button" className="sug-modal__secundario" onClick={onClose}>Cancelar</button>
              <button type="submit" className="sug-modal__enviar" disabled={estado === 'enviando' || !texto.trim()}>
                {estado === 'enviando' ? 'Enviando…' : 'Enviar sugestão'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body
  )
}
