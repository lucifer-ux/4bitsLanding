import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  assetsInclude: [
    "**/*.stl",
    "**/*.exr",
    "**/*.png",
    "**/*.glb",
    "**/*.pdf",
    "**/*.jfif",
    "**/*.jpg",
    "**/*.avif",
    "**/*.obj",
    "**/*.OBJ",
    "**/*.mtl"
  ], 
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
