import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import './HubPage.css'

// Página inicial de metodoavva.com: a porta de entrada do AVVA Hub.
// Leva para a área das alunas, para a aplicação da mentoria e para o suporte.
const WHATSAPP_SUPORTE = 'https://wa.me/5519920002917?text=' + encodeURIComponent('Oi! Vim pelo AVVA Hub e preciso de ajuda.')

function Seta() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
    </svg>
  )
}

export default function HubPage() {
  useEffect(() => { document.title = 'AVVA Hub' }, [])

  return (
    <div className="hub">
      <div className="hub__bg" aria-hidden="true">
        <div className="hub__orb hub__orb--1" />
        <div className="hub__orb hub__orb--2" />
      </div>

      <main className="hub__main">
        <header className="hub__header">
          <span className="hub__kicker">Bem-vinda ao</span>
          <h1>AVVA Hub</h1>
          <p>Que bom ter você aqui. Escolha para onde quer ir.</p>
        </header>

        <nav className="hub__cards" aria-label="Para onde você quer ir">
          <Link to="/login" className="hub-card hub-card--alunas">
            <span className="hub-card__icone" aria-hidden="true">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2z" /><path d="M22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7z" /></svg>
            </span>
            <span className="hub-card__kicker">Já sou aluna</span>
            <strong>Acessar a área de alunas</strong>
            <span className="hub-card__texto">Entre com o e-mail da compra e continue de onde parou: Acervo de Anúncios, Kit e tudo que você já tem.</span>
            <span className="hub-card__cta">Entrar <Seta /></span>
          </Link>

          <Link to="/mentoria" className="hub-card hub-card--mentoria">
            <span className="hub-card__icone" aria-hidden="true">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8l-6.2 4.5 2.4-7.4L2 9.4h7.6z" /></svg>
            </span>
            <span className="hub-card__kicker">Mentoria AVVA</span>
            <strong>Quero aplicar para a mentoria</strong>
            <span className="hub-card__texto">Acompanhamento individual para quem já tem um negócio digital rodando e quer construir a estrutura que sustenta a vida que escolheu viver.</span>
            <span className="hub-card__cta">Fazer minha aplicação <Seta /></span>
          </Link>
        </nav>

        <a className="hub__suporte" href={WHATSAPP_SUPORTE} target="_blank" rel="noreferrer">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.5 14.4c-.3-.1-1.8-.9-2-1s-.5-.1-.7.1-.8 1-.9 1.2-.3.2-.6.1a8 8 0 0 1-2.4-1.5 9 9 0 0 1-1.6-2c-.2-.3 0-.5.1-.6l.5-.5.3-.5v-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6a1.1 1.1 0 0 0-.8.4 3.4 3.4 0 0 0-1 2.5 6 6 0 0 0 1.2 3.1 13.4 13.4 0 0 0 5.2 4.6c.7.3 1.3.5 1.7.6a4.2 4.2 0 0 0 1.9.1 3.1 3.1 0 0 0 2-1.4 2.5 2.5 0 0 0 .2-1.4c-.1-.2-.3-.3-.6-.4zM12 21.8a9.8 9.8 0 0 1-5-1.4l-.4-.2-3.7 1 1-3.6-.2-.4A9.8 9.8 0 1 1 12 21.8zm0-21.6A11.8 11.8 0 0 0 1.8 17.9L.1 24l6.3-1.7A11.8 11.8 0 1 0 12 .2z" /></svg>
          <span>Precisa de ajuda? <strong>Fale com o suporte</strong></span>
        </a>

        <footer className="hub__rodape">© {new Date().getFullYear()} AVVA Hub</footer>
      </main>
    </div>
  )
}
