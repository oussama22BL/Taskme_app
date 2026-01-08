import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "@": "/src",
      "@context": "/src/context",
      "@components": "/src/components",
      "@pages": "/src/pages",
    },
  },
  plugins: [react()],
  
  // AJOUTEZ CETTE SECTION
  server: {
    port: 5173,
    host: true, // pour accéder depuis le réseau
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // votre backend
        changeOrigin: true,
        secure: false,
        // rewrite: (path) => path.replace(/^\/api/, '') // Optionnel
      }
    }
  }
})