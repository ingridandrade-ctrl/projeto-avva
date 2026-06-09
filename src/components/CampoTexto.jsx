import './CampoTexto.css'

export default function CampoTexto({ value, onChange, multiline, placeholder }) {
  if (multiline) {
    return (
      <textarea
        className="campo-texto campo-texto--multiline"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={5}
      />
    )
  }

  return (
    <input
      type="text"
      className="campo-texto"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
    />
  )
}
