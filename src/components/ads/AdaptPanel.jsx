import { useMemo, useState } from 'react'
import CopyButton from '../ui/CopyButton'
import { FICHA_CAMPOS, loadFicha, saveFicha, fichaCompleta, buildPrompt, linkChatGPT, linkClaude } from '../../lib/adaptar'
import './AdaptPanel.css'

// "Adaptar pra mim": a aluna preenche uma ficha curta (fica salva no aparelho)
// e recebe um prompt pronto com a análise deste anúncio para colar na IA.
export default function AdaptPanel({ ad, collectionTitle }) {
  const [open, setOpen] = useState(false)
  const [ficha, setFicha] = useState(() => loadFicha())
  const [verPrompt, setVerPrompt] = useState(false)

  const completa = fichaCompleta(ficha)
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
        Adaptar pra mim
        <span className="adapt__hint">{open ? 'fechar' : 'com IA'}</span>
      </button>

      {open && (
        <div className="adapt__body">
          <p className="adapt__intro">
            Preenche uma vez e fica salvo aqui no seu aparelho. Depois é copiar o prompt, colar na IA e responder ao que ela pedir.
          </p>

          <div className="adapt__ficha">
            {FICHA_CAMPOS.map(c => (
              <label key={c.key} className="adapt__field">
                <span>{c.label}</span>
                <input
                  type="text"
                  value={ficha[c.key] || ''}
                  onChange={e => edit(c.key, e.target.value)}
                  placeholder={c.placeholder}
                />
              </label>
            ))}
          </div>

          {!completa && <p className="adapt__aviso">Preenche os quatro primeiros campos pra liberar o prompt.</p>}

          <div className="adapt__acoes">
            <CopyButton text={prompt} label="Copiar prompt" />
            <a className={`adapt__link ${completa ? '' : 'adapt__link--off'}`} href={completa ? linkChatGPT(prompt) : undefined} target="_blank" rel="noreferrer" onClick={e => { if (!completa) e.preventDefault() }}>Abrir no ChatGPT</a>
            <a className={`adapt__link ${completa ? '' : 'adapt__link--off'}`} href={completa ? linkClaude(prompt) : undefined} target="_blank" rel="noreferrer" onClick={e => { if (!completa) e.preventDefault() }}>Abrir no Claude</a>
            <button type="button" className="adapt__ver" onClick={() => setVerPrompt(v => !v)}>{verPrompt ? 'Esconder o prompt' : 'Ver o prompt'}</button>
          </div>

          {verPrompt && <pre className="adapt__prompt">{prompt}</pre>}

          <p className="adapt__nota">A IA escreve, você decide. Se sair uma prova que você não tem, apaga.</p>
        </div>
      )}
    </div>
  )
}
