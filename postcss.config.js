/**
 * ============================================================
 * File        : postcss.config.js
 * Deskripsi   : Konfigurasi PostCSS sebagai preprocessor CSS.
 *               Menggunakan @tailwindcss/postcss (paket terpisah
 *               untuk Tailwind CSS v4) dan autoprefixer untuk
 *               menambahkan vendor prefix otomatis (-webkit-, -moz-)
 *               agar CSS kompatibel dengan browser lama.
 * Pembuat      : Muhammad Ammar Luthfi Azzufar
 * Tanggal Dibuat : 10-08-2026
 * Versi        : 1.0.0
 * ============================================================
 */

/** @type {import('@tailwindcss/postcss').Config} */
export default {
  plugins: {
    // @tailwindcss/postcss adalah paket baru di Tailwind v4 yang menggantikan
    // 'tailwindcss' langsung sebagai plugin PostCSS (yang sudah deprecated di v4)
    '@tailwindcss/postcss': {},
    // autoprefixer menganalisis output CSS dan menambahkan prefix vendor
    // berdasarkan data browser compatibility dari caniuse.com
    autoprefixer: {},
  },
};
