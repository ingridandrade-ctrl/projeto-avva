import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import CopyButton from '../../components/ui/CopyButton'
import './KitPage.css'

const GANCHOS = [
  { tipo: 'Pergunta provocativa', exemplo: 'Você sabia que 80% dos anúncios falham nos primeiros 3 segundos?' },
  { tipo: 'Declaração chocante', exemplo: 'Eu gastei R$50 mil em anúncios antes de descobrir isso.' },
  { tipo: 'Curiosidade', exemplo: 'O segredo que as marcas que mais vendem não contam...' },
  { tipo: 'Dor', exemplo: 'Cansada de criar conteúdo que ninguém vê?' },
  { tipo: 'Prova social', exemplo: 'Esse método já ajudou +200 alunas a triplicar o faturamento.' },
  { tipo: 'Urgência', exemplo: 'Se você não mudar agora, o algoritmo vai te engolir.' },
  { tipo: 'Polêmica', exemplo: 'O marketing de conteúdo está morto — e eu vou te provar.' },
  { tipo: 'Tutorial', exemplo: 'Em 60 segundos eu vou te ensinar a criar um anúncio que vende.' },
]

const ESTRUTURAS = [
  {
    nome: 'Problema → Agitação → Solução (PAS)',
    descricao: 'Apresente o problema, amplifique a dor, depois mostre a solução.',
    exemplo: '"Você gasta horas criando conteúdo e ninguém engaja? → Enquanto isso, seus concorrentes estão vendendo todos os dias. → Com o método X, você cria anúncios que convertem em minutos."',
  },
  {
    nome: 'Antes → Depois → Ponte',
    descricao: 'Mostre o antes (dor), o depois (transformação) e a ponte (seu produto).',
    exemplo: '"Antes: zero vendas pelo Instagram. → Depois: 30 vendas por semana com tráfego pago. → A ponte: o Acervo de Criativos."',
  },
  {
    nome: 'Gancho → História → Oferta',
    descricao: 'Prenda a atenção, conte uma história real, feche com a oferta.',
    exemplo: '"Eu perdi R$5 mil em anúncios no primeiro mês. → Até que descobri que o problema era o criativo, não o público. → Hoje eu vendo todo dia com esses modelos."',
  },
  {
    nome: 'AIDA (Atenção → Interesse → Desejo → Ação)',
    descricao: 'Estrutura clássica para anúncios diretos.',
    exemplo: '"Atenção: 3 erros que travam suas vendas. → Interesse: A maioria das empreendedoras comete pelo menos 2. → Desejo: Imagine ter templates prontos que já foram testados. → Ação: Clique e acesse agora."',
  },
]

const ANGULOS = [
  {
    momento: 'Topo de funil',
    descricao: 'Público frio — foque em curiosidade, dor e identificação.',
    prompts: [
      'Crie 5 ganchos de anúncio para [nicho] focando na maior dor de quem ainda não conhece a marca. O tom deve ser leve e curioso.',
      'Escreva 3 roteiros de 30 segundos para vídeo UGC no nicho de [nicho]. O objetivo é parar o scroll e gerar curiosidade.',
    ],
  },
  {
    momento: 'Meio de funil',
    descricao: 'Público morno — foque em autoridade, prova social e educação.',
    prompts: [
      'Crie 5 ganchos de anúncio para [nicho] focando em provas sociais e resultados. O público já conhece o problema, precisa confiar na solução.',
      'Escreva um roteiro de 45 segundos estilo talking head para [nicho] usando a estrutura Antes/Depois/Ponte.',
    ],
  },
  {
    momento: 'Fundo de funil',
    descricao: 'Público quente — foque em urgência, escassez e CTA direto.',
    prompts: [
      'Crie 5 ganchos com urgência para [nicho]. O público já sabe o que quer — precisa de um empurrão final.',
      'Escreva 3 variações de CTA para anúncio de [produto] no nicho de [nicho]. Foque em escassez e resultado imediato.',
    ],
  },
]

export default function KitPage() {
  const { profile } = useAuth()

  if (!profile?.has_order_bump) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="kit-page">
      <h1>Kit de Execução</h1>
      <p className="kit-page__desc">
        Ganchos prontos, estruturas narrativas e prompts de IA para criar seus anúncios.
      </p>

      <section className="kit-section">
        <h2>Tipos de gancho prontos</h2>
        <div className="gancho-grid">
          {GANCHOS.map((g, i) => (
            <div key={i} className="gancho-card">
              <span className="gancho-card__tipo">{g.tipo}</span>
              <p className="gancho-card__exemplo">"{g.exemplo}"</p>
              <CopyButton text={g.exemplo} />
            </div>
          ))}
        </div>
      </section>

      <section className="kit-section">
        <h2>Estruturas narrativas</h2>
        <div className="estrutura-grid">
          {ESTRUTURAS.map((e, i) => (
            <div key={i} className="estrutura-card">
              <h3>{e.nome}</h3>
              <p className="estrutura-card__desc">{e.descricao}</p>
              <div className="estrutura-card__exemplo">
                <span className="estrutura-card__label">Exemplo:</span>
                <p>{e.exemplo}</p>
              </div>
              <CopyButton text={e.exemplo} />
            </div>
          ))}
        </div>
      </section>

      <section className="kit-section">
        <h2>Ângulos de copy + Prompts de IA</h2>
        <div className="angulo-grid">
          {ANGULOS.map((a, i) => (
            <div key={i} className="angulo-card">
              <h3>{a.momento}</h3>
              <p className="angulo-card__desc">{a.descricao}</p>
              <div className="angulo-card__prompts">
                {a.prompts.map((prompt, j) => (
                  <div key={j} className="angulo-card__prompt">
                    <p className="mono">{prompt}</p>
                    <CopyButton text={prompt} label="Copiar prompt" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
