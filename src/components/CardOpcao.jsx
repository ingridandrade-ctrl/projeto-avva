import './CardOpcao.css'

export default function CardOpcao({ label, selected, onClick }) {
  return (
    <button
      type="button"
      className={`card-opcao ${selected ? 'card-opcao--selected' : ''}`}
      onClick={onClick}
      aria-pressed={selected}
    >
      <span>{label}</span>
      <span className="card-opcao__check" aria-hidden="true">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
      </span>
    </button>
  )
}
