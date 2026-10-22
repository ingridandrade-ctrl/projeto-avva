import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Dois HTMLs com metadados próprios para prévias (WhatsApp/Instagram):
// index.html serve o formulário (/ e /mentoria/*), acervo.html a página de vendas
// do Acervo (/acervo) e membros.html a área de membros.
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        membros: 'membros.html',
        acervo: 'acervo.html',
      },
    },
  },
})
