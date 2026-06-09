import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import CardOpcao from './CardOpcao'
import CampoTexto from './CampoTexto'
import './FormularioAvva.css'

const PERGUNTAS = [
  {
    key: 'nome',
    titulo: 'Qual é o seu nome?',
    tipo: 'texto',
  },
  {
    key: 'whatsapp',
    titulo: 'Qual o seu melhor WhatsApp?',
    subtitulo: 'Prometo não te encher de mensagem 😂',
    tipo: 'texto',
  },
  {
    key: 'email',
    titulo: 'Qual o seu melhor e-mail?',
    tipo: 'texto',
  },
  {
    key: 'instagram',
    titulo: 'Qual o seu @ do Instagram?',
    tipo: 'texto',
    placeholder: '@',
  },
  {
    key: 'nicho',
    titulo: 'Qual é o seu nicho ou área de atuação?',
    tipo: 'texto',
  },
  {
    key: 'tempo_atuacao',
    titulo: 'Há quanto tempo você atua na sua área?',
    tipo: 'texto',
  },
  {
    key: 'faturamento_atual',
    titulo: 'Qual é o seu faturamento médio mensal hoje?',
    tipo: 'cards',
    opcoes: [
      'até R$1.000',
      'entre R$2.000 e R$4.000',
      'entre R$5.000 e R$8.000',
      'entre R$10.000 e R$17.000',
      'entre R$17.000 e R$30.000',
      'mais de R$30.000',
    ],
  },
  {
    key: 'objetivo_faturamento',
    titulo: 'Qual é o seu objetivo de faturamento nos próximos 6 meses?',
    subtitulo: 'Pensa de forma realista — não o sonho máximo, o próximo nível real.',
    tipo: 'cards',
    opcoes: [
      'R$5.000 por mês',
      'entre R$5.000 e R$10.000 por mês',
      'entre R$10.000 e R$15.000 por mês',
      'entre R$15.000 e R$20.000 por mês',
      'entre R$20.000 e R$30.000 por mês',
      'mais de R$30.000 por mês',
    ],
  },
  {
    key: 'preco_produto_principal',
    titulo: 'Quanto você cobra pelo seu serviço ou produto principal hoje?',
    subtitulo: 'Seja mentoria, consultoria, serviço, prestação de serviço no digital ou curso online — pensa na entrega que você mais quer vender agora.',
    tipo: 'cards',
    opcoes: [
      'a partir de R$500',
      'entre R$1.000 e R$2.000',
      'entre R$2.000 e R$3.500',
      'entre R$3.500 e R$5.000',
      'entre R$5.000 e R$10.000',
      'mais de R$10.000',
    ],
  },
  {
    key: 'tem_equipe',
    titulo: 'Você já tem equipe?',
    subtitulo: 'Designer, social media, assistente, contabilidade...',
    tipo: 'cards',
    opcoes: [
      'sim, de 1 a 3 pessoas',
      'sim, de 4 a 10 pessoas',
      'ainda não, mas quero estruturar isso em breve',
      'não tenho e não penso em ter',
    ],
  },
  {
    key: 'o_que_trava',
    titulo: 'O que você sente que está travando o seu crescimento hoje?',
    subtitulo: 'Pode ser falta de clareza, de estratégia, de estrutura, de tempo... Seja detalhista. Essa pergunta faz diferença na hora de eu ler sua aplicação.',
    tipo: 'textarea',
  },
  {
    key: 'experiencia_mentoria',
    titulo: 'Você já fez alguma mentoria ou acompanhamento individual antes?',
    tipo: 'cards',
    opcoes: [
      'sim, e tive bons resultados',
      'sim, mas não tive o resultado que esperava',
      'nunca fiz',
    ],
  },
  {
    key: 'como_chegou',
    titulo: 'Como você chegou até aqui?',
    tipo: 'cards',
    opcoes: [
      'conteúdo no Instagram',
      'indicação',
      'TikTok',
    ],
  },
  {
    key: 'momento_atual',
    titulo: 'Qual é o seu momento agora?',
    tipo: 'cards',
    opcoes: [
      'é prioridade pra mim estruturar isso o quanto antes',
      'sei que preciso, mas ainda não encontrei o caminho certo',
      'estou pesquisando, ainda não decidi',
    ],
  },
  {
    key: 'visao_futuro',
    titulo: 'Como você imagina seu negócio daqui a um ano?',
    subtitulo: 'Faturamento, rotina, presença, processos — descreve o cenário que você quer construir.',
    tipo: 'textarea',
  },
  {
    key: 'por_que_eu',
    titulo: 'O que te fez pensar em mim para te acompanhar nesse momento?',
    subtitulo: 'Pode ser honesta. Isso importa pra mim ❤️',
    tipo: 'textarea',
  },
]

const TOTAL_STEPS = PERGUNTAS.length + 2 // intro + avisos + perguntas

export default function FormularioAvva({ origem }) {
  const [step, setStep] = useState(0) // 0 = intro, 1 = avisos, 2+ = perguntas
  const [form, setForm] = useState(() => {
    const init = {}
    PERGUNTAS.forEach(p => { init[p.key] = '' })
    return init
  })
  const [direction, setDirection] = useState('next')
  const [animating, setAnimating] = useState(false)
  const [erro, setErro] = useState(false)
  const [sending, setSending] = useState(false)
  const navigate = useNavigate()

  const set = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }))
    setErro(false)
  }

  const goTo = (nextStep) => {
    if (animating) return
    setDirection(nextStep > step ? 'next' : 'prev')
    setAnimating(true)
    setTimeout(() => {
      setStep(nextStep)
      setAnimating(false)
    }, 400)
  }

  const perguntaIndex = step - 2
  const perguntaAtual = PERGUNTAS[perguntaIndex]
  const isLastQuestion = perguntaIndex === PERGUNTAS.length - 1

  const canAdvance = () => {
    if (step < 2) return true
    const p = PERGUNTAS[perguntaIndex]
    return form[p.key].trim() !== ''
  }

  const handleNext = () => {
    if (step < 2) {
      goTo(step + 1)
      return
    }

    if (!canAdvance()) {
      setErro(true)
      return
    }

    if (isLastQuestion) {
      handleSubmit()
      return
    }

    goTo(step + 1)
  }

  const handleBack = () => {
    if (step > 0) goTo(step - 1)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && perguntaAtual?.tipo !== 'textarea') {
      e.preventDefault()
      handleNext()
    }
  }

  const handleSubmit = async () => {
    setSending(true)
    const { error } = await supabase.from('aplicacoes').insert({
      ...form,
      origem,
      status: 'nova',
    })

    if (error) {
      console.error(error)
      alert('Erro ao enviar. Tente novamente.')
      setSending(false)
      return
    }

    navigate('/confirmacao')
  }

  const progress = step < 2 ? 0 : ((perguntaIndex + 1) / PERGUNTAS.length) * 100

  return (
    <div className="form-page" onKeyDown={handleKeyDown}>
      {/* Progress bar */}
      {step >= 2 && (
        <div className="progress-bar">
          <div className="progress-bar__fill" style={{ width: `${progress}%` }} />
        </div>
      )}

      {/* Floating decorations */}
      <div className="floating-decorations">
        <span className="float-element float-1">✦</span>
        <span className="float-element float-2">◇</span>
        <span className="float-element float-3">✦</span>
        <span className="float-element float-4">○</span>
      </div>

      <div className={`step-container ${animating ? `step--exit-${direction}` : 'step--enter'}`}>

        {/* STEP 0 — Intro */}
        {step === 0 && (
          <div className="step step-intro">
            <div className="step-intro__content">
              <p className="intro-eyebrow">Mentoria Avva</p>
              <h1 className="intro-headline">
                Se você chegou até aqui, provavelmente seu negócio já funciona,{' '}
                <span className="intro-highlight">mas tem pesado mais do que deveria.</span>
              </h1>
              <p className="intro-body">
                Você está aqui porque quer mais do que um negócio que roda — quer um negócio que sustente a vida que você escolheu viver.
              </p>
              <p className="intro-body">
                A Mentoria Avva é um acompanhamento individual para empreendedoras que já têm um negócio digital rodando, mas sabem que precisam construir a estrutura que sustenta essa vida, e não o contrário.
              </p>
              <p className="intro-body">
                Nossa metodologia é organizada em quatro dimensões — porque acreditamos que negócio e pessoa não se separam.
              </p>
              <div className="dimensoes">
                <span className="dimensao-tag">Alma</span>
                <span className="dimensao-tag">Voz</span>
                <span className="dimensao-tag">Vida</span>
                <span className="dimensao-tag">Ascensão</span>
              </div>
              <p className="intro-body intro-body--emphasis">
                É pra quem está pronta pra olhar de verdade pro que construiu — e decidir o que fica, o que muda e o que vai.
              </p>
              <button className="btn-primary" onClick={handleNext}>
                Continuar
                <span className="btn-arrow">→</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 1 — Avisos */}
        {step === 1 && (
          <div className="step step-avisos">
            <div className="step-avisos__content">
              <p className="avisos-eyebrow">Antes de começar</p>
              <h2 className="avisos-titulo">Algumas coisas importantes</h2>
              <div className="avisos-lista">
                <div className="aviso-item">
                  <span className="aviso-num">01</span>
                  <p>Responder o formulário não garante vaga ou chamada. Cada aplicação é lida com atenção para entender se consigo te ajudar de verdade.</p>
                </div>
                <div className="aviso-item">
                  <span className="aviso-num">02</span>
                  <p>Se fizer sentido pros dois lados, a gente marca uma conversa.</p>
                </div>
                <div className="aviso-item">
                  <span className="aviso-num">03</span>
                  <p>Seja honesta. Quanto mais real for o que você escrever, mais útil eu consigo ser desde o primeiro momento.</p>
                </div>
              </div>
              <button className="btn-primary btn-primary--light" onClick={handleNext}>
                Vamos começar
                <span className="btn-arrow">→</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2+ — Perguntas */}
        {step >= 2 && perguntaAtual && (
          <div className="step step-pergunta">
            <div className="step-pergunta__content">
              <span className="pergunta-counter">
                {String(perguntaIndex + 1).padStart(2, '0')} / {String(PERGUNTAS.length).padStart(2, '0')}
              </span>
              <h2 className="pergunta-titulo">{perguntaAtual.titulo}</h2>
              {perguntaAtual.subtitulo && (
                <p className="pergunta-subtitulo">{perguntaAtual.subtitulo}</p>
              )}

              <div className="pergunta-input">
                {perguntaAtual.tipo === 'texto' && (
                  <CampoTexto
                    value={form[perguntaAtual.key]}
                    onChange={v => set(perguntaAtual.key, v)}
                    placeholder={perguntaAtual.placeholder}
                  />
                )}
                {perguntaAtual.tipo === 'textarea' && (
                  <CampoTexto
                    value={form[perguntaAtual.key]}
                    onChange={v => set(perguntaAtual.key, v)}
                    multiline
                  />
                )}
                {perguntaAtual.tipo === 'cards' && (
                  <div className="cards-grid">
                    {perguntaAtual.opcoes.map(op => (
                      <CardOpcao
                        key={op}
                        label={op}
                        selected={form[perguntaAtual.key] === op}
                        onClick={() => set(perguntaAtual.key, op)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {erro && (
                <p className="pergunta-erro">Por favor, preencha este campo para continuar</p>
              )}

              <div className="step-nav">
                <button className="btn-back" onClick={handleBack}>
                  ← Voltar
                </button>
                <button
                  className="btn-primary"
                  onClick={handleNext}
                  disabled={sending}
                >
                  {sending ? 'Enviando...' : isLastQuestion ? 'Enviar aplicação' : 'Continuar'}
                  <span className="btn-arrow">→</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
