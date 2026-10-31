import { useState } from 'react'

// Foto da aluna; sem foto (ou se a imagem falhar), a inicial do nome.
export default function Avatar({ profile, className = '', fallback = '?' }) {
  const [falhou, setFalhou] = useState(null)
  const url = profile?.avatar_url
  const inicial = profile?.name?.trim()?.[0]?.toUpperCase() || profile?.email?.[0]?.toUpperCase() || fallback
  if (url && falhou !== url) {
    return <img className={`avatar-img ${className}`} src={url} alt="" onError={() => setFalhou(url)} />
  }
  return <>{inicial}</>
}
