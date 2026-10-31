import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import './SuggestionBox.css'

// Caixinha de sugestões: faixa fina dentro do produto. O Acervo é um projeto
// vivo e a aluna ajuda a decidir o que entra. Vai para a tabela "sugestoes".
export default function SuggestionBox() {
  const { session, profile } = useAuth()
  const location = useLocation()
  const [texto, setTexto] = useState('')
  const [estado, setEstado] = useState('idle') // idle | enviando | enviado | erro

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

  return (
    <section className="sugestoes" aria-label="Caixinha de sugestões">
      <div className="sugestoes__texto">
        <span className="sugestoes__kicker">Caixinha de sugestões</span>
        <h2>O Acervo é um projeto vivo, e estamos aqui pra te ouvir.</h2>
        <p>Sentiu falta de algo? Quer uma curadoria? Conta o que você quer ver nas próximas atualizações.</p>
      </div>

      {estado === 'enviado' ? (
        <div className="sugestoes__ok">
          <strong>Recebemos. Obrigada!</strong>
          <span>Vai direto pra mesa de quem monta o Acervo.</span>
          <button type="button" className="sugestoes__outra" onClick={() => setEstado('idle')}>Mandar outra</button>
        </div>
      ) : (
        <form className="sugestoes__form" onSubmit={enviar}>
          <textarea
            value={texto}
            onChange={e => setTexto(e.target.value)}
            placeholder="Ex.: queria ver mais anúncios de negócio local…"
            rows={1}
            maxLength={2000}
            required
            aria-label="Sua sugestão"
          />
          <button type="submit" className="sugestoes__enviar" disabled={estado === 'enviando' || !texto.trim()}>
            {estado === 'enviando' ? 'Enviando…' : 'Enviar'}
          </button>
          {estado === 'erro' && <span className="sugestoes__erro">Não foi dessa vez. Tenta de novo?</span>}
        </form>
      )}
    </section>
  )
}
