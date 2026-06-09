import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import CardOpcao from './CardOpcao'
import CampoTexto from './CampoTexto'
import './FormularioAvva.css'

const FATURAMENTO_ATUAL = [
  'até R$1.000',
  'entre R$2.000 e R$4.000',
  'entre R$5.000 e R$8.000',
  'entre R$10.000 e R$17.000',
  'entre R$17.000 e R$30.000',
  'mais de R$30.000',
]

const OBJETIVO_FATURAMENTO = [
  'R$5.000 por mês',
  'entre R$5.000 e R$10.000 por mês',
  'entre R$10.000 e R$15.000 por mês',
  'entre R$15.000 e R$20.000 por mês',
  'entre R$20.000 e R$30.000 por mês',
  'mais de R$30.000 por mês',
]

const PRECO_PRODUTO = [
  'a partir de R$500',
  'entre R$1.000 e R$2.000',
  'entre R$2.000 e R$3.500',
  'entre R$3.500 e R$5.000',
  'entre R$5.000 e R$10.000',
  'mais de R$10.000',
]

const TEM_EQUIPE = [
  'sim, de 1 a 3 pessoas',
  'sim, de 4 a 10 pessoas',
  'ainda não, mas quero estruturar isso em breve',
  'não tenho e não penso em ter',
]

const EXPERIENCIA_MENTORIA = [
  'sim, e tive bons resultados',
  'sim, mas não tive o resultado que esperava',
  'nunca fiz',
]

const COMO_CHEGOU = [
  'conteúdo no Instagram',
  'indicação',
  'TikTok',
]

const MOMENTO_ATUAL = [
  'é prioridade pra mim estruturar isso o quanto antes',
  'sei que preciso, mas ainda não encontrei o caminho certo',
  'estou pesquisando, ainda não decidi',
]

const initialForm = {
  nome: '',
  whatsapp: '',
  email: '',
  instagram: '',
  nicho: '',
  tempo_atuacao: '',
  faturamento_atual: '',
  objetivo_faturamento: '',
  preco_produto_principal: '',
  tem_equipe: '',
  o_que_trava: '',
  experiencia_mentoria: '',
  como_chegou: '',
  momento_atual: '',
  visao_futuro: '',
  por_que_eu: '',
}

export default function FormularioAvva({ origem }) {
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [sending, setSending] = useState(false)
  const navigate = useNavigate()

  const set = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: false }))
    }
  }

  const validate = () => {
    const newErrors = {}
    for (const key of Object.keys(initialForm)) {
      if (!form[key].trim()) newErrors[key] = true
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) {
      const firstError = document.querySelector('.pergunta--erro')
      if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

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

  return (
    <div className="formulario-page">
      {/* Bloco 1 — Introdução */}
      <section className="bloco-intro">
        <div className="bloco-intro__container">
          <div className="intro-decorations">
            <span className="deco deco--1">✦</span>
            <span className="deco deco--2">✦</span>
            <span className="deco deco--3">◇</span>
          </div>

          <p className="intro-destaque">
            Se você chegou até aqui, provavelmente seu negócio já funciona,{' '}
            <span className="highlight">mas tem pesado mais do que deveria</span>, e você sabe disso.
          </p>
          <p className="intro-texto">
            Você está aqui porque quer mais do que um negócio que roda — quer um negócio que sustente a vida que você escolheu viver.
          </p>
          <p className="intro-texto">
            A Mentoria Avva é um acompanhamento individual para empreendedoras que já têm um negócio digital rodando, mas sabem que precisam construir a estrutura que sustenta essa vida, e não o contrário.
          </p>
          <p className="intro-texto">
            Nossa metodologia é organizada em quatro dimensões —{' '}
            <strong>Alma, Voz, Vida e Ascensão</strong> — porque acreditamos que negócio e pessoa não se separam. Antes de qualquer estratégia de negócio, vem clareza sobre o que funciona para a sua vida. Antes de qualquer movimento, vem estrutura.
          </p>

          <div className="dimensoes">
            <span className="dimensao-tag">Alma</span>
            <span className="dimensao-tag">Voz</span>
            <span className="dimensao-tag">Vida</span>
            <span className="dimensao-tag">Ascensão</span>
          </div>

          <p className="intro-texto">
            Esse acompanhamento não é pra quem está começando do zero, pra quem busca fórmula pronta ou checklist pra seguir.
          </p>
          <p className="intro-texto intro-destaque-final">
            É pra quem está pronta pra olhar de verdade pro que construiu — e decidir o que fica, o que muda e o que vai.
          </p>
        </div>
      </section>

      {/* Bloco 2 — Avisos + CTA */}
      <section className="bloco-avisos">
        <div className="bloco-avisos__container">
          <h2 className="avisos-titulo">Algumas coisas importantes antes de preencher:</h2>
          <div className="avisos-lista">
            <div className="aviso">
              <p>Responder o formulário não garante vaga ou chamada. Cada aplicação é lida com atenção para entender se consigo te ajudar de verdade.</p>
            </div>
            <div className="aviso">
              <p>Se fizer sentido pros dois lados, a gente marca uma conversa.</p>
            </div>
            <div className="aviso">
              <p>Seja honesta. Quanto mais real for o que você escrever, mais útil eu consigo ser desde o primeiro momento.</p>
            </div>
          </div>
          <a href="#formulario" className="btn-cta">Vamos começar →</a>
        </div>
      </section>

      {/* Bloco 3 — Formulário */}
      <section className="bloco-formulario" id="formulario">
        <form className="form-container" onSubmit={handleSubmit} noValidate>

          <Pergunta num={1} titulo="Qual é o seu nome?" erro={errors.nome}>
            <CampoTexto value={form.nome} onChange={v => set('nome', v)} />
          </Pergunta>

          <Pergunta num={2} titulo="Qual o seu melhor WhatsApp?" subtitulo="Prometo não te encher de mensagem 😂" erro={errors.whatsapp}>
            <CampoTexto value={form.whatsapp} onChange={v => set('whatsapp', v)} />
          </Pergunta>

          <Pergunta num={3} titulo="Qual o seu melhor e-mail?" erro={errors.email}>
            <CampoTexto value={form.email} onChange={v => set('email', v)} />
          </Pergunta>

          <Pergunta num={4} titulo="Qual o seu @ do Instagram?" erro={errors.instagram}>
            <CampoTexto value={form.instagram} onChange={v => set('instagram', v)} placeholder="@" />
          </Pergunta>

          <Pergunta num={5} titulo="Qual é o seu nicho ou área de atuação?" erro={errors.nicho}>
            <CampoTexto value={form.nicho} onChange={v => set('nicho', v)} />
          </Pergunta>

          <Pergunta num={6} titulo="Há quanto tempo você atua na sua área?" erro={errors.tempo_atuacao}>
            <CampoTexto value={form.tempo_atuacao} onChange={v => set('tempo_atuacao', v)} />
          </Pergunta>

          <Pergunta num={7} titulo="Qual é o seu faturamento médio mensal hoje?" erro={errors.faturamento_atual}>
            <div className="cards-grid">
              {FATURAMENTO_ATUAL.map(op => (
                <CardOpcao key={op} label={op} selected={form.faturamento_atual === op} onClick={() => set('faturamento_atual', op)} />
              ))}
            </div>
          </Pergunta>

          <Pergunta num={8} titulo="Qual é o seu objetivo de faturamento nos próximos 6 meses?" subtitulo="Pensa de forma realista — não o sonho máximo, o próximo nível real." erro={errors.objetivo_faturamento}>
            <div className="cards-grid">
              {OBJETIVO_FATURAMENTO.map(op => (
                <CardOpcao key={op} label={op} selected={form.objetivo_faturamento === op} onClick={() => set('objetivo_faturamento', op)} />
              ))}
            </div>
          </Pergunta>

          <Pergunta num={9} titulo="Quanto você cobra pelo seu serviço ou produto principal hoje?" subtitulo="Seja mentoria, consultoria, serviço, prestação de serviço no digital ou curso online — pensa na entrega que você mais quer vender agora." erro={errors.preco_produto_principal}>
            <div className="cards-grid">
              {PRECO_PRODUTO.map(op => (
                <CardOpcao key={op} label={op} selected={form.preco_produto_principal === op} onClick={() => set('preco_produto_principal', op)} />
              ))}
            </div>
          </Pergunta>

          <Pergunta num={10} titulo="Você já tem equipe?" subtitulo="Designer, social media, assistente, contabilidade..." erro={errors.tem_equipe}>
            <div className="cards-grid">
              {TEM_EQUIPE.map(op => (
                <CardOpcao key={op} label={op} selected={form.tem_equipe === op} onClick={() => set('tem_equipe', op)} />
              ))}
            </div>
          </Pergunta>

          <Pergunta num={11} titulo="O que você sente que está travando o seu crescimento hoje?" subtitulo="Pode ser falta de clareza, de estratégia, de estrutura, de tempo... Seja detalhista. Essa pergunta faz diferença na hora de eu ler sua aplicação." erro={errors.o_que_trava}>
            <CampoTexto value={form.o_que_trava} onChange={v => set('o_que_trava', v)} multiline />
          </Pergunta>

          <Pergunta num={12} titulo="Você já fez alguma mentoria ou acompanhamento individual antes?" erro={errors.experiencia_mentoria}>
            <div className="cards-grid">
              {EXPERIENCIA_MENTORIA.map(op => (
                <CardOpcao key={op} label={op} selected={form.experiencia_mentoria === op} onClick={() => set('experiencia_mentoria', op)} />
              ))}
            </div>
          </Pergunta>

          <Pergunta num={13} titulo="Como você chegou até aqui?" erro={errors.como_chegou}>
            <div className="cards-grid">
              {COMO_CHEGOU.map(op => (
                <CardOpcao key={op} label={op} selected={form.como_chegou === op} onClick={() => set('como_chegou', op)} />
              ))}
            </div>
          </Pergunta>

          <Pergunta num={14} titulo="Qual é o seu momento agora?" erro={errors.momento_atual}>
            <div className="cards-grid">
              {MOMENTO_ATUAL.map(op => (
                <CardOpcao key={op} label={op} selected={form.momento_atual === op} onClick={() => set('momento_atual', op)} />
              ))}
            </div>
          </Pergunta>

          <Pergunta num={15} titulo="Como você imagina seu negócio daqui a um ano?" subtitulo="Faturamento, rotina, presença, processos — descreve o cenário que você quer construir." erro={errors.visao_futuro}>
            <CampoTexto value={form.visao_futuro} onChange={v => set('visao_futuro', v)} multiline />
          </Pergunta>

          <Pergunta num={16} titulo="O que te fez pensar em mim para te acompanhar nesse momento?" subtitulo="Pode ser honesta. Isso importa pra mim ❤️" erro={errors.por_que_eu}>
            <CampoTexto value={form.por_que_eu} onChange={v => set('por_que_eu', v)} multiline />
          </Pergunta>

          <div className="form-submit">
            <button type="submit" className="btn-enviar" disabled={sending}>
              {sending ? 'Enviando...' : 'Enviar aplicação →'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

function Pergunta({ num, titulo, subtitulo, erro, children }) {
  return (
    <div className={`pergunta ${erro ? 'pergunta--erro' : ''}`}>
      <label className="pergunta-titulo">
        <span className="pergunta-num">{num}.</span> {titulo}
      </label>
      {subtitulo && <p className="pergunta-subtitulo">{subtitulo}</p>}
      {children}
      {erro && <span className="pergunta-erro-msg">Este campo é obrigatório</span>}
    </div>
  )
}
