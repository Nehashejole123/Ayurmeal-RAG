import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    // This connects the Frontend (5173) to Backend (8000)
    proxy: {
      '/voice-process': 'http://127.0.0.1:8000',
      '/greeting': 'http://127.0.0.1:8000',
      '/chat': 'http://127.0.0.1:8000',
    }
  }
})