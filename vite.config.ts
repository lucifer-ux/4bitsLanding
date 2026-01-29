import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5000,
    open: true,
    host: true,
    allowedHosts: ['multilobed-scoriaceous-zayden.ngrok-free.dev']
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})