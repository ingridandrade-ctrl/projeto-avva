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
  }, [step])

  const transition = (nextStep) => {
    setAnimClass('exit')
    setTimeout(() => {
      setStep(nextStep)
      setAnimClass('enter')
      setTimeout(() => setAnimClass('visible'), 50)
    }, 450)
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
      {step >= 2 && (
        <div className="fp-progress">
          <div className="fp-progress__bar" style={{ width: `${progress}%` }} />
        </div>
      )}

      {step >= 2 && (
        <div className="fp-counter">
          {String(pi + 1).padStart(2, '0')}<span className="fp-counter__sep">/</span>{String(PERGUNTAS.length).padStart(2, '0')}
        </div>
      )}

      <div className={`fp-step fp-step--${animClass}`}>

        {step === 0 && (
          <div className="fp-intro">
            <div className="fp-intro__left">
              <div className="fp-intro__badge">Mentoria Avva</div>
              <h1 className="fp-intro__h1">
                Seu negócio já funciona.
                <br />
                <em>Mas tem pesado mais do que deveria.</em>
              </h1>
              <button className="fp-btn" onClick={handleNext}>
                <span>Descobrir mais</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
            </div>
            <div className="fp-intro__right">
              <div className="fp-intro__card">
                <p>Você está aqui porque quer mais do que um negócio que roda — quer um negócio que sustente a vida que você escolheu viver.</p>
              </div>
              <div className="fp-intro__dims">
                <span>Alma</span>
                <span>Voz</span>
                <span>Vida</span>
                <span>Ascensão</span>
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="fp-avisos">
            <div className="fp-avisos__inner">
              <span className="fp-avisos__eyebrow">Antes de começar</span>
              <h2 className="fp-avisos__title">Algumas coisas<br />importantes.</h2>
              <div className="fp-avisos__grid">
                <div className="fp-aviso">
                  <div className="fp-aviso__line" />
                  <p>Responder o formulário não garante vaga ou chamada. Cada aplicação é lida com atenção para entender se consigo te ajudar de verdade.</p>
                </div>
                <div className="fp-aviso">
                  <div className="fp-aviso__line" />
                  <p>Se fizer sentido pros dois lados, a gente marca uma conversa.</p>
                </div>
                <div className="fp-aviso">
                  <div className="fp-aviso__line" />
                  <p>Seja honesta. Quanto mais real for o que você escrever, mais útil eu consigo ser desde o primeiro momento.</p>
                </div>
              </div>
              <button className="fp-btn fp-btn--light" onClick={handleNext}>
                <span>Vamos começar</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
            </div>
          </div>
        )}

        {step >= 2 && p && (
          <div className="fp-question">
            <div className="fp-question__inner">
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

              <div className="fp-nav">
                <button className="fp-nav__back" onClick={handleBack} type="button">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                  Voltar
                </button>
                <button className="fp-btn" onClick={handleNext} disabled={sending} type="button">
                  <span>{sending ? 'Enviando...' : isLast ? 'Enviar aplicação' : 'Continuar'}</span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </button>
              </div>

              {p.tipo === 'texto' && (
                <p className="fp-hint">Pressione <kbd>Enter ↵</kbd> para continuar</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
