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
})

