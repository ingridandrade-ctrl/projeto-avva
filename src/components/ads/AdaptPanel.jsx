import { useMemo, useState } from 'react'
import CopyButton from '../ui/CopyButton'
import { CAMPOS, TIPOS, DESTINOS, DESTINO_SUGESTAO, DESTINO_AJUDA, loadFicha, saveFicha, buildPrompt, linkChatGPT, linkClaude } from '../../lib/adaptar'
import './AdaptPanel.css'

// "Fazer a minha versão": abre a IA com a análise deste anúncio, as perguntas
// certas para a coleção dele e o negócio da aluna. Campos opcionais, salvos no
// aparelho; o que faltar, a IA pergunta antes de escrever.
export default function AdaptPanel({ ad, collectionTitle }) {
  const [open, setOpen] = useState(false)
  const [ficha, setFicha] = useState(() => loadFicha())
  const [verPrompt, setVerPrompt] = useState(false)

  const prompt = useMemo(() => buildPrompt({ ad, collectionTitle, ficha }), [ad, collectionTitle, ficha])
  const sugestao = (ad.objectives || []).map(o => DESTINO_SUGESTAO[o]).filter(Boolean)[0]

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
            A IA destrincha a análise desse anúncio pela lente da coleção e escreve a sua versão. Nenhum campo é obrigatório: o que você preencher fica salvo no seu aparelho, e o que faltar ela pergunta antes de escrever.
          </p>

          <div className="adapt__destinos">
            <span>Tipo de negócio</span>
            <div className="adapt__chips">
              {TIPOS.map(t => (
                <button type="button" key={t} className={`adapt__chip ${ficha.tipo === t ? 'adapt__chip--on' : ''}`} onClick={() => edit('tipo', ficha.tipo === t ? '' : t)}>{t}</button>
              ))}
            </div>
          </div>

          <div className="adapt__grid">
          {CAMPOS.map(c => (
            <label key={c.key} className="adapt__field">
              <span>{c.label}</span>
              <small>{c.ajuda}</small>
              <input
                type="text"
                value={ficha[c.key] || ''}
                onChange={e => edit(c.key, e.target.value)}
                placeholder={c.placeholder}
              />
            </label>
          ))}
          </div>

          <div className="adapt__destinos">
            <span>Pra onde o anúncio leva</span>
            <small>{DESTINO_AJUDA}</small>
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
            {sugestao && <p className="adapt__sugestao">{sugestao}</p>}
          </div>

          <div className="adapt__acoes">
            <a className="adapt__cta" href={linkChatGPT(prompt)} target="_blank" rel="noreferrer">
              Abrir no ChatGPT
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </a>
            <a className="adapt__link" href={linkClaude(prompt)} target="_blank" rel="noreferrer">Abrir no Claude</a>
            <CopyButton text={prompt} label="Copiar prompt" />
            <button type="button" className="adapt__ver" onClick={() => setVerPrompt(v => !v)}>{verPrompt ? 'Esconder' : 'Ver o prompt'}</button>
          </div>

          {verPrompt && <pre className="adapt__prompt">{prompt}</pre>}

          <p className="adapt__nota">A IA escreve, você decide. Se sair uma prova que você não tem, apaga.</p>
        </div>
      )}
    </div>
  )
}
