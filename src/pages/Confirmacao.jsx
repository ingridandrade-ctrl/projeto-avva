import './Confirmacao.css'

export default function Confirmacao() {
  return (
    <div className="confirmacao">
      <div className="confirmacao__decorations">
        <span className="conf-float conf-float--1">✦</span>
        <span className="conf-float conf-float--2">◇</span>
        <span className="conf-float conf-float--3">✦</span>
      </div>
      <div className="confirmacao__container">
        <span className="confirmacao__icon">✦</span>
        <p className="confirmacao__texto">
          Você deu um passo importante.
        </p>
        <p className="confirmacao__texto confirmacao__texto--sub">
          Vou ler sua aplicação com atenção e, se fizer sentido pros dois lados, entro em contato pra a gente conversar 🖤
        </p>
      </div>
    </div>
  )
}
