import { useMemo, useState } from 'react'
import CopyButton from '../ui/CopyButton'
import { DESTINOS, loadFicha, saveFicha, buildPrompt, linkChatGPT } from '../../lib/adaptar'
import './AdaptPanel.css'

// "Fazer a minha versão": um toque abre a IA com a análise deste anúncio e o
// pedido pronto. O negócio da aluna é opcional (fica salvo no aparelho); sem
// ele, a IA pergunta antes de escrever.
export default function AdaptPanel({ ad, collectionTitle }) {
  const [open, setOpen] = useState(false)
  const [ficha, setFicha] = useState(() => loadFicha())

  const prompt = useMemo(() => buildPrompt({ ad, collectionTitle, ficha }), [ad, collectionTitle, ficha])

  function edit(key, value) {
    const next = { ...ficha, [key]: value }
    setFicha(next)
    saveFicha(next)
  }

  return (
    <div className={`adapt ${open ? 'adapt--open' : ''}`}>
      <button type="button" className="adapt__toggle" onClick={() => setOpen(v => !v)} aria-expanded={open}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/></svg>
        Fazer a minha versão
        <span className="adapt__hint">{open ? 'fechar' : 'com IA'}</span>
      </button>

      {open && (
        <div className="adapt__body">
          <p className="adapt__intro">
            A IA recebe a análise desse anúncio e escreve a sua versão: gancho, roteiro e legenda. Você só revisa.
          </p>

          <label className="adapt__field">
            <span>Seu negócio em uma frase <em>(opcional, fica salvo)</em></span>
            <input
              type="text"
              value={ficha.negocio || ''}
              onChange={e => edit('negocio', e.target.value)}
              placeholder="Ex.: consultoria de imagem pra mulheres acima de 40"
            />
          </label>

          <div className="adapt__destinos">
            <span>O anúncio leva pra</span>
            <div className="adapt__chips">
              {DESTINOS.map(d => (
                <button
                  type="button"
                  key={d}
                  className={`adapt__chip ${ficha.destino === d ? 'adapt__chip--on' : ''}`}
                  onClick={() => edit('destino', ficha.destino === d ? '' : d)}
                >{d}</button>
              ))}
            </div>
          </div>

          <div className="adapt__acoes">
            <a className="adapt__cta" href={linkChatGPT(prompt)} target="_blank" rel="noreferrer">
              Abrir no ChatGPT
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </a>
            <CopyButton text={prompt} label="Copiar prompt pra outra IA" />
          </div>

          <p className="adapt__nota">Se você não escreveu o seu negócio, a IA pergunta primeiro. Se ela inventar uma prova que você não tem, apaga.</p>
        </div>
      )}
    </div>
  )
}
