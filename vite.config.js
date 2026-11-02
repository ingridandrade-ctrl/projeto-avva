import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Quatro HTMLs com metadados próprios para prévias (WhatsApp/Instagram):
// index.html serve a página inicial do AVVA Hub (/), mentoria.html o formulário (/mentoria/*), acervo.html a página de vendas
// do Acervo (/acervo-de-anuncios) e membros.html a área de membros.
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        mentoria: 'mentoria.html',
        membros: 'membros.html',
        acervo: 'acervo.html',
      },
    },
  },
})
