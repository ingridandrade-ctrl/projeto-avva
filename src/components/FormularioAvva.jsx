import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import CardOpcao from './CardOpcao'
import CampoTexto from './CampoTexto'
import './FormularioAvva.css'

const PERGUNTAS = [
  { key: 'nome', titulo: 'Qual é o seu nome?', tipo: 'texto' },
  { key: 'whatsapp', titulo: 'Qual o seu melhor WhatsApp?', subtitulo: 'Prometo não te encher de mensagem 😂', tipo: 'texto' },
  { key: 'email', titulo: 'Qual o seu melhor e-mail?', tipo: 'texto' },
  { key: 'instagram', titulo: 'Qual o seu @ do Instagram?', tipo: 'texto', placeholder: '@seuuser' },
  { key: 'nicho', titulo: 'Qual é o seu nicho ou área de atuação?', tipo: 'texto' },
  { key: 'tempo_atuacao', titulo: 'Há quanto tempo você atua na sua área?', tipo: 'texto' },
  {
    key: 'faturamento_atual', titulo: 'Qual é o seu faturamento médio mensal hoje?', tipo: 'cards',
    opcoes: ['até R$1.000', 'entre R$2.000 e R$4.000', 'entre R$5.000 e R$8.000', 'entre R$10.000 e R$17.000', 'entre R$17.000 e R$30.000', 'mais de R$30.000'],
  },
  {
    key: 'objetivo_faturamento', titulo: 'Qual é o seu objetivo de faturamento nos próximos 6 meses?',
    subtitulo: 'Pensa de forma realista — não o sonho máximo, o próximo nível real.', tipo: 'cards',
    opcoes: ['R$5.000 por mês', 'entre R$5.000 e R$10.000 por mês', 'entre R$10.000 e R$15.000 por mês', 'entre R$15.000 e R$20.000 por mês', 'entre R$20.000 e R$30.000 por mês', 'mais de R$30.000 por mês'],
  },
  {
    key: 'preco_produto_principal', titulo: 'Quanto você cobra pelo seu serviço ou produto principal hoje?',
    subtitulo: 'Seja mentoria, consultoria, serviço, prestação de serviço no digital ou curso online — pensa na entrega que você mais quer vender agora.', tipo: 'cards',
    opcoes: ['a partir de R$500', 'entre R$1.000 e R$2.000', 'entre R$2.000 e R$3.500', 'entre R$3.500 e R$5.000', 'entre R$5.000 e R$10.000', 'mais de R$10.000'],
  },
  {
    key: 'tem_equipe', titulo: 'Você já tem equipe?', subtitulo: 'Designer, social media, assistente, contabilidade...', tipo: 'cards',
    opcoes: ['sim, de 1 a 3 pessoas', 'sim, de 4 a 10 pessoas', 'ainda não, mas quero estruturar isso em breve', 'não tenho e não penso em ter'],
  },
  {
    key: 'o_que_trava', titulo: 'O que você sente que está travando o seu crescimento hoje?',
    subtitulo: 'Pode ser falta de clareza, de estratégia, de estrutura, de tempo... Seja detalhista. Essa pergunta faz diferença na hora de eu ler sua aplicação.', tipo: 'textarea',
  },
  {
    key: 'experiencia_mentoria', titulo: 'Você já fez alguma mentoria ou acompanhamento individual antes?', tipo: 'cards',
    opcoes: ['sim, e tive bons resultados', 'sim, mas não tive o resultado que esperava', 'nunca fiz'],
  },
  {
    key: 'como_chegou', titulo: 'Como você chegou até aqui?', tipo: 'cards',
    opcoes: ['conteúdo no Instagram', 'indicação', 'TikTok'],
  },
  {
    key: 'momento_atual', titulo: 'Qual é o seu momento agora?', tipo: 'cards',
    opcoes: ['é prioridade pra mim estruturar isso o quanto antes', 'sei que preciso, mas ainda não encontrei o caminho certo', 'estou pesquisando, ainda não decidi'],
  },
  {
    key: 'visao_futuro', titulo: 'Como você imagina seu negócio daqui a um ano?',
    subtitulo: 'Faturamento, rotina, presença, processos — descreve o cenário que você quer construir.', tipo: 'textarea',
  },
  {
    key: 'por_que_eu', titulo: 'O que te fez pensar em mim para te acompanhar nesse momento?',
    subtitulo: 'Pode ser honesta. Isso importa pra mim ❤️', tipo: 'textarea',
  },
]

export default function FormularioAvva({ origem }) {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState(() => {
    const init = {}
    PERGUNTAS.forEach(p => { init[p.key] = '' })
    return init
  })
  const [animClass, setAnimClass] = useState('visible')
  const [erro, setErro] = useState(false)
  const [sending, setSending] = useState(false)
  const inputRef = useRef(null)
  const navigate = useNavigate()

  const set = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }))
    setErro(false)
  }

  useEffect(() => {
    if (step >= 2 && inputRef.current) {
      const el = inputRef.current.querySelector('input, textarea')
      if (el) setTimeout(() => el.focus(), 500)
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [step])

  const transition = (nextStep) => {
    setAnimClass('exit')
    setTimeout(() => {
      setStep(nextStep)
      setAnimClass('enter')
      setTimeout(() => setAnimClass('visible'), 50)
    }, 400)
  }

  const pi = step - 2
  const p = PERGUNTAS[pi]
  const isLast = pi === PERGUNTAS.length - 1

  const handleNext = () => {
    if (step < 2) { transition(step + 1); return }
    if (!form[p.key].trim()) { setErro(true); return }
    if (isLast) { handleSubmit(); return }
    transition(step + 1)
  }

  const handleBack = () => { if (step > 0) transition(step - 1) }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && p?.tipo !== 'textarea') {
      e.preventDefault()
      handleNext()
    }
  }

  const handleSubmit = async () => {
    setSending(true)
    const { error } = await supabase.from('aplicacoes').insert({ ...form, origem, status: 'nova' })
    if (error) { alert('Erro ao enviar. Tente novamente.'); setSending(false); return }
    navigate('/confirmacao')
  }

  const progress = step < 2 ? 0 : ((pi + 1) / PERGUNTAS.length) * 100

  return (
    <div className="fp" onKeyDown={handleKeyDown}>
      {/* Progress */}
      {step >= 2 && (
        <div className="fp-progress">
          <div className="fp-progress__bar" style={{ width: `${progress}%` }} />
        </div>
      )}

      {/* Back button — always visible after step 0 */}
      {step > 0 && (
        <button className={`fp-back-global ${step === 1 ? 'fp-back-global--light' : ''}`} onClick={handleBack} type="button">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
          <span>Voltar</span>
        </button>
      )}

      {/* Counter */}
      {step >= 2 && (
        <div className="fp-counter">
          {String(pi + 1).padStart(2, '0')}<span className="fp-counter__sep">/</span>{String(PERGUNTAS.length).padStart(2, '0')}
        </div>
      )}

      <div className={`fp-step fp-step--${animClass}`}>

        {/* ═══ INTRO ═══ */}
        {step === 0 && (
          <div className="fp-intro">
            <div className="fp-intro__content">
              <span className="fp-badge">Mentoria Avva</span>

              <h1 className="fp-intro__h1">
                Se você chegou até aqui, provavelmente seu negócio já funciona,{' '}
                <em>mas tem pesado mais do que deveria</em>, e você sabe disso.
              </h1>

              <p className="fp-intro__body">
                Você está aqui porque quer mais do que um negócio que roda — quer um negócio que sustente a vida que você escolheu viver.
              </p>

              <p className="fp-intro__body">
                A Mentoria Avva é um acompanhamento individual para empreendedoras que já têm um negócio digital rodando, mas sabem que precisam construir a estrutura que sustenta essa vida, e não o contrário.
              </p>

              <p className="fp-intro__body">
                Nossa metodologia é organizada em quatro dimensões — <strong>Alma, Voz, Vida e Ascensão</strong> — porque acreditamos que negócio e pessoa não se separam. Antes de qualquer estratégia de negócio, vem clareza sobre o que funciona para a sua vida. Antes de qualquer movimento, vem estrutura.
              </p>

              <div className="fp-dims">
                <span className="fp-dim">Alma</span>
                <span className="fp-dim">Voz</span>
                <span className="fp-dim">Vida</span>
                <span className="fp-dim">Ascensão</span>
              </div>

              <p className="fp-intro__body">
                Esse acompanhamento não é pra quem está começando do zero, pra quem busca fórmula pronta ou checklist pra seguir.
              </p>

              <p className="fp-intro__closing">
                É pra quem está pronta pra olhar de verdade pro que construiu — e decidir o que fica, o que muda e o que vai.
              </p>

              <button className="fp-btn" onClick={handleNext}>
                <span>Continuar</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>
              </button>
            </div>
          </div>
        )}

        {/* ═══ AVISOS ═══ */}
        {step === 1 && (
          <div className="fp-avisos">
            <div className="fp-avisos__content">
              <span className="fp-badge fp-badge--light">Antes de preencher</span>

              <h2 className="fp-avisos__h2">
                Algumas coisas importantes antes de preencher:
              </h2>

              <div className="fp-avisos__list">
                <div className="fp-aviso-card">
                  <p>Responder o formulário não garante vaga ou chamada. Cada aplicação é lida com atenção para entender se consigo te ajudar de verdade.</p>
                </div>
                <div className="fp-aviso-card">
                  <p>Se fizer sentido pros dois lados, a gente marca uma conversa.</p>
                </div>
                <div className="fp-aviso-card">
                  <p>Seja honesta. Quanto mais real for o que você escrever, mais útil eu consigo ser desde o primeiro momento.</p>
                </div>
              </div>

              <button className="fp-btn fp-btn--on-dark" onClick={handleNext}>
                <span>Vamos começar</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>
              </button>
            </div>
          </div>
        )}

        {/* ═══ PERGUNTAS ═══ */}
        {step >= 2 && p && (
          <div className="fp-question">
            <div className="fp-question__content">
              <h2 className="fp-question__title">{p.titulo}</h2>
              {p.subtitulo && <p className="fp-question__sub">{p.subtitulo}</p>}

              <div className="fp-question__input" ref={inputRef}>
                {p.tipo === 'texto' && (
                  <CampoTexto value={form[p.key]} onChange={v => set(p.key, v)} placeholder={p.placeholder} />
                )}
                {p.tipo === 'textarea' && (
                  <CampoTexto value={form[p.key]} onChange={v => set(p.key, v)} multiline />
                )}
                {p.tipo === 'cards' && (
                  <div className="fp-cards">
                    {p.opcoes.map(op => (
                      <CardOpcao key={op} label={op} selected={form[p.key] === op} onClick={() => set(p.key, op)} />
                    ))}
                  </div>
                )}
              </div>

              {erro && <p className="fp-erro">Preencha este campo para continuar</p>}

              <div className="fp-question__footer">
                <button className="fp-btn" onClick={handleNext} disabled={sending} type="button">
                  <span>{sending ? 'Enviando...' : isLast ? 'Enviar aplicação' : 'Continuar'}</span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>
                </button>

                {p.tipo === 'texto' && (
                  <p className="fp-hint">Pressione <kbd>Enter ↵</kbd> para continuar</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
