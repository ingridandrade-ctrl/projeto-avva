import './CardOpcao.css'

export default function CardOpcao({ label, selected, onClick }) {
  return (
    <button
      type="button"
      className={`card-opcao ${selected ? 'card-opcao--selected' : ''}`}
      onClick={onClick}
    >
      {label}
    </button>
  )
}
