import './Confirmacao.css'

export default function Confirmacao() {
  return (
    <div className="conf">
      <div className="conf__glow" />
      <div className="conf__inner">
        <span className="conf__symbol" aria-hidden="true">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
        </span>
        <h1 className="conf__title">
          Você deu um passo<br />importante.
        </h1>
        <p className="conf__text">
          Vou ler sua aplicação com atenção e, se fizer sentido pros dois lados, entro em contato pra a gente conversar <span className="conf__heart">♥</span>
        </p>
      </div>
    </div>
  )
}
