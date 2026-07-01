import { useState } from 'react'
import './CopyButton.css'

export default function CopyButton({ text, label = 'Copiar' }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button className="copy-btn" onClick={handleCopy}>
      {copied ? 'Copiado!' : label}
    </button>
  )
}
