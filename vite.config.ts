/**
 * ============================================================
 * File        : vite.config.ts
 * Deskripsi   : Konfigurasi bundler Vite untuk aplikasi React.
 *               Plugin react() mengaktifkan JSX transform dan
 *               Fast Refresh. Tailwind CSS v4 dihandle melalui
 *               PostCSS (@tailwindcss/postcss) bukan Vite plugin
 *               agar tidak ada konflik konfigurasi.
 * Pembuat      : Muhammad Ammar Luthfi Azzufar
 * Tanggal Dibuat : 10-08-2026
 * Versi        : 1.0.0
 * ============================================================
 */

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Tailwind v4 dihandle lewat PostCSS (@tailwindcss/postcss) bukan lewat Vite plugin
// agar tidak konflik dengan postcss.config.js yang sudah ada.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, // Frontend berjalan di port 3000, backend di 5000 (lihat server.ts)
  }
})
