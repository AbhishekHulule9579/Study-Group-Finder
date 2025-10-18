import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // --- CONFIRMED SERVER PROXY CONFIGURATION ---
  server: {
    proxy: {
      // Proxy all requests starting with /api to the Spring Boot backend
      '/api': {
        // *** CRITICAL FIX: CHANGED PORT TO 8145 (from application.properties) ***
        target: 'http://localhost:8145', 
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path, 
      },
    },
  },
  // ----------------------------------------
})
