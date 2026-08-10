/**
 * ============================================================
 * File        : tailwind.config.js
 * Deskripsi   : Konfigurasi Tailwind CSS v4 untuk mendefinisikan
 *               tema kustom aplikasi. Menentukan warna primary
 *               (#44A1A4) sebagai warna dominan sistem, serta
 *               content paths agar Tailwind hanya menghasilkan
 *               CSS untuk class yang benar-benar digunakan
 *               (tree-shaking CSS → bundle lebih kecil).
 * Pembuat      : Muhammad Ammar Luthfi Azzufar
 * Tanggal Dibuat : 10-08-2026
 * Versi        : 1.0.0
 * ============================================================
 */

/** @type {import('tailwindcss').Config} */
export default {
  // content menentukan file mana yang di-scan untuk class Tailwind.
  // Hanya class yang ditemukan di file ini yang akan dimasukkan ke bundle CSS akhir.
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Warna dominan aplikasi sesuai permintaan: #44A1A4 (teal)
        primary: "#44A1A4",
        // Varian gelap untuk state hover button, dihitung secara manual
        // agar kontras cukup (WCAG AA) saat text putih di atasnya
        "primary-dark": "#2d7c7e",
        "primary-light": "#6ac3c6",
      }
    },
  },
  plugins: [],
}
