import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Dois HTMLs com metadados próprios para prévias (WhatsApp/Instagram):
// index.html serve o formulário (/ e /aplicacao/*), membros.html a área de membros.
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        membros: 'membros.html',
      },
    },
  },
})
