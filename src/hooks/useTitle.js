import { useEffect } from 'react'

// Título da aba: "Página — AVVA Hub" (ou só "AVVA Hub")
export function useTitle(pagina) {
  useEffect(() => {
    document.title = pagina ? `${pagina} — AVVA Hub` : 'AVVA Hub'
  }, [pagina])
}
