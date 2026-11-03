import { useMemo, useState } from 'react'
import CopyButton from '../ui/CopyButton'
import { CAMPOS, TIPOS, TONS, DESTINOS, DESTINO_SUGESTAO, DESTINO_AJUDA, loadFicha, saveFicha, buildPrompt, linkChatGPT, linkClaude, cabeNoLink } from '../../lib/adaptar'
import { isPage } from '../../lib/catalog'
import './AdaptPanel.css'

// "Fazer a minha versão": a IA entende a sequência deste anúncio, confere se
// a aluna deu material pra cada passo, escreve a fala na voz dela e só então
// corta em cenas. Campos opcionais, salvos no aparelho; o que faltar, a IA
// pergunta antes de escrever.
export default function AdaptPanel({ ad, collectionTitle, collectionSlug }) {
  const [open, setOpen] = useState(false)
  const [ficha, setFicha] = useState(() => loadFicha())
  const [verPrompt, setVerPrompt] = useState(false)

  const prompt = useMemo(() => buildPrompt({ ad, collectionTitle, collectionSlug, ficha }), [ad, collectionTitle, collectionSlug, ficha])
  const cabe = useMemo(() => cabeNoLink(prompt), [prompt])
  const sugestao = (ad.objectives || []).map(o => DESTINO_SUGESTAO[o]).filter(Boolean)[0]
  const pagina = isPage(ad)
  const tomAtual = TONS.find(t => t.nome === ficha.tom)

  const negocio = CAMPOS.filter(c => c.grupo === 'negocio')
  const voz = CAMPOS.filter(c => c.grupo === 'voz')
  const ganha = CAMPOS.find(c => c.key === 'ganha')

  function edit(key, value) {
    const next = { ...ficha, [key]: value }
    setFicha(next)
    saveFicha(next)
  }

  const campo = (c) => (
    <label key={c.key} className={`adapt__field ${c.longo ? 'adapt__field--longo' : ''}`}>
      <span className="adapt__rotulo">{c.label}</span>
      <small>{c.ajuda}</small>
      {c.longo ? (
        <textarea rows={4} value={ficha[c.key] || ''} onChange={e => edit(c.key, e.target.value)} placeholder={c.placeholder} />
      ) : (
        <input type="text" value={ficha[c.key] || ''} onChange={e => edit(c.key, e.target.value)} placeholder={c.placeholder} />
      )}
    </label>
  )

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
            <strong>{pagina ? 'A IA entende a sequência dessa página e escreve a sua, bloco por bloco, na sua voz.' : 'A IA entende a sequência desse anúncio e escreve a sua versão na sua voz, com a mesma duração.'}</strong>{' '}
            Nenhum campo é obrigatório. O que você preencher fica salvo no seu aparelho, e o que faltar ela pergunta antes de escrever.
          </p>

          <section className="adapt__passo">
            <header className="adapt__passo-head">
              <span className="adapt__num">1</span>
              <h4>Seu negócio</h4>
            </header>

            <div className="adapt__grupo">
              <span className="adapt__rotulo">Tipo de negócio</span>
              <div className="adapt__chips">
                {TIPOS.map(t => (
                  <button type="button" key={t} className={`adapt__chip ${ficha.tipo === t ? 'adapt__chip--on' : ''}`} onClick={() => edit('tipo', ficha.tipo === t ? '' : t)}>{t}</button>
                ))}
              </div>
            </div>

            <div className="adapt__grid">
              {negocio.map(campo)}
            </div>
          </section>

          <section className="adapt__passo">
            <header className="adapt__passo-head">
              <span className="adapt__num">2</span>
              <div>
                <h4>A sua voz</h4>
                <small>É o que mais tira a cara de IA. Um texto seu vale mais que qualquer ajuste.</small>
              </div>
            </header>

            <div className="adapt__grid">
              {voz.map(campo)}
            </div>

            <div className="adapt__grupo">
              <span className="adapt__rotulo">Como você escreve</span>
              <small className="adapt__ajuda">Escolha um. Cada opção vira uma regra concreta pra IA, não um adjetivo.</small>
              <div className="adapt__chips">
                {TONS.map(t => (
                  <button type="button" key={t.nome} className={`adapt__chip ${ficha.tom === t.nome ? 'adapt__chip--on' : ''}`} onClick={() => edit('tom', ficha.tom === t.nome ? '' : t.nome)}>{t.nome}</button>
                ))}
              </div>
              {tomAtual && <p className="adapt__sugestao">{tomAtual.regra}</p>}
              <input
                type="text"
                className="adapt__outro"
                value={ficha.tomOutro || ''}
                onChange={e => edit('tomOutro', e.target.value)}
                placeholder="Mais sobre o seu jeito, se quiser: ex. falo rápido, sem rodeio"
              />
            </div>
          </section>

          {!pagina && <section className="adapt__passo">
            <header className="adapt__passo-head">
              <span className="adapt__num">3</span>
              <div>
                <h4>Pra onde o anúncio leva</h4>
                <small>{DESTINO_AJUDA}</small>
              </div>
            </header>
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
            <div className="adapt__grid adapt__grid--um">
              {campo(ganha)}
            </div>
            {sugestao && <p className="adapt__sugestao">{sugestao}</p>}
          </section>}

          <section className="adapt__passo adapt__passo--final">
            <header className="adapt__passo-head">
              <span className="adapt__num">{pagina ? 3 : 4}</span>
              <div>
                <h4>Agora é só abrir na IA</h4>
                <small>Se ela perguntar antes de escrever, é de propósito: responda e ela continua. Se sair uma prova que você não tem, apaga.</small>
              </div>
            </header>

            {cabe ? (
              <div className="adapt__ias">
                <a className="adapt__cta" href={linkChatGPT(prompt)} target="_blank" rel="noreferrer">
                  Abrir no ChatGPT
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </a>
                <a className="adapt__cta adapt__cta--claude" href={linkClaude(prompt)} target="_blank" rel="noreferrer">
                  Abrir no Claude
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </a>
              </div>
            ) : (
              <div className="adapt__ias adapt__ias--copiar">
                <CopyButton text={prompt} label="Copiar o prompt" />
                <p className="adapt__aviso">Com o seu texto, o prompt ficou longo demais pra abrir pelo link. Copie e cole no ChatGPT ou no Claude.</p>
              </div>
            )}

            <div className="adapt__extras">
              {cabe && <>
                <span>Prefere outra IA?</span>
                <CopyButton text={prompt} label="Copiar prompt" />
              </>}
              <button type="button" className="adapt__ver" onClick={() => setVerPrompt(v => !v)}>{verPrompt ? 'Esconder o prompt' : 'Ver o prompt'}</button>
            </div>

            {verPrompt && <pre className="adapt__prompt">{prompt}</pre>}
          </section>
        </div>
      )}
    </div>
  )
}
