import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Tailwind v4 dihandle lewat PostCSS (@tailwindcss/postcss) bukan lewat Vite plugin
// agar tidak konflik dengan postcss.config.js
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  }
})
