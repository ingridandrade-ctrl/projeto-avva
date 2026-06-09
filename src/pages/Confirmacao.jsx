import './Confirmacao.css'

export default function Confirmacao() {
  return (
    <div className="conf">
      <div className="conf__glow" />
      <div className="conf__inner">
        <span className="conf__symbol">✦</span>
        <h1 className="conf__title">
          Você deu um passo<br />importante.
        </h1>
        <p className="conf__text">
          Vou ler sua aplicação com atenção e, se fizer sentido pros dois lados, entro em contato pra a gente conversar 🖤
        </p>
      </div>
    </div>
  )
}
