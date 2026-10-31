import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { TIPOS_SUGESTAO as TIPOS } from '../../lib/sugestoes'
import './SuggestionBox.css'

const PLACEHOLDER = {
  sugestao: 'Ex.: queria ver mais anúncios de negócio local, ou um filtro por formato…',
  curadoria: 'Ex.: uma coleção só de anúncios pra Dia das Mães, ou de serviço de estética…',
  erro: 'Ex.: o anúncio tal não abre no celular, ou a análise está trocada…',
  elogio: 'Manda ver. A gente lê tudo.',
}

// Caixinha de sugestões: o Acervo é um projeto vivo e a aluna ajuda a decidir
// o que entra. Vai para a tabela "sugestoes" e aparece no admin.
export default function SuggestionBox({ compact = false }) {
  const { session, profile } = useAuth()
  const location = useLocation()
  const [tipo, setTipo] = useState('sugestao')
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
      tipo,
      texto: t,
      pagina: location.pathname,
    })
    if (error) { setEstado('erro'); return }
    setEstado('enviado')
    setTexto('')
  }

  return (
    <section className={`sugestoes ${compact ? 'sugestoes--compact' : ''}`} aria-label="Caixinha de sugestões">
      <div className="sugestoes__inner">
        <div className="sugestoes__texto">
          <span className="sugestoes__kicker">Caixinha de sugestões</span>
          <h2>O Acervo é um projeto vivo. E a gente está aqui pra te ouvir.</h2>
          <p>Sentiu falta de algo? Quer que a gente faça uma curadoria? Achou um erro? Conta pra gente o que você quer ver nas próximas atualizações.</p>
        </div>

        {estado === 'enviado' ? (
          <div className="sugestoes__ok">
            <strong>Recebemos. Obrigada!</strong>
            <span>Tudo que chega aqui vai pra mesa de quem monta o Acervo.</span>
            <button type="button" className="sugestoes__outra" onClick={() => setEstado('idle')}>Mandar outra</button>
          </div>
        ) : (
          <form className="sugestoes__form" onSubmit={enviar}>
            <div className="sugestoes__chips" role="radiogroup" aria-label="Tipo">
              {TIPOS.map(t => (
                <button
                  type="button"
                  key={t.value}
                  role="radio"
                  aria-checked={tipo === t.value}
                  className={`sugestoes__chip ${tipo === t.value ? 'sugestoes__chip--on' : ''}`}
                  onClick={() => setTipo(t.value)}
                >{t.label}</button>
              ))}
            </div>
            <textarea
              value={texto}
              onChange={e => setTexto(e.target.value)}
              placeholder={PLACEHOLDER[tipo]}
              rows={3}
              maxLength={2000}
              required
            />
            <div className="sugestoes__acoes">
              <button type="submit" className="sugestoes__enviar" disabled={estado === 'enviando' || !texto.trim()}>
                {estado === 'enviando' ? 'Enviando…' : 'Enviar sugestão'}
              </button>
              {estado === 'erro' && <span className="sugestoes__erro">Não foi dessa vez. Tenta de novo?</span>}
            </div>
          </form>
        )}
      </div>
    </section>
  )
}
