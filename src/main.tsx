/**
 * ============================================================
 * File        : main.tsx
 * Deskripsi   : Entry point utama aplikasi React. Menginisialisasi
 *               root DOM React dan me-render komponen App dengan
 *               StrictMode aktif untuk mendeteksi potensi masalah
 *               (double render di development, deprecated API, dll).
 * Fungsi      : (Tidak ada deklarasi fungsi, hanya mounting React DOM)
 * Pembuat      : Muhammad Ammar Luthfi Azzufar
 * Tanggal Dibuat : 10-08-2026
 * Versi        : 1.0.0
 * ============================================================
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// createRoot adalah React 18+ API yang mendukung Concurrent Features.
// Non-null assertion (!) digunakan karena kita yakin elemen 'root' ada di index.html.
// Jika tidak ada, akan throw error lebih awal (fail-fast) daripada bug diam-diam.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
