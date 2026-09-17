import './CampoTexto.css'

export default function CampoTexto({ value, onChange, multiline, placeholder, type = 'text', maxLength }) {
  if (multiline) {
    return (
      <textarea
        className="campo-texto campo-texto--multiline"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={5}
        maxLength={maxLength}
        aria-labelledby="fp-question-title"
      />
    )
  }

  return (
    <input
      type={type}
      inputMode={type === 'tel' ? 'tel' : type === 'email' ? 'email' : undefined}
      autoComplete={type === 'tel' ? 'tel' : type === 'email' ? 'email' : 'off'}
      className="campo-texto"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      maxLength={maxLength}
      aria-labelledby="fp-question-title"
    />
  )
}
