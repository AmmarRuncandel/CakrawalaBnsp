/**
 * ============================================================
 * File        : App.tsx
 * Deskripsi   : Root komponen React yang mengatur sistem routing
 *               seluruh aplikasi menggunakan React Router v7.
 *               Mendefinisikan ProtectedRoute untuk memastikan
 *               halaman dashboard hanya dapat diakses oleh user
 *               yang sudah login dengan role yang sesuai.
 * Fungsi      :
 *   - ProtectedRoute: Komponen guard (pelindung) rute khusus member login.
 *   - App           : Komponen root aplikasi penentu seluruh alur routing.
 * Pembuat      : Muhammad Ammar Luthfi Azzufar
 * Tanggal Dibuat : 10-08-2026
 * Versi        : 1.0.0
 * ============================================================
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import DashboardPengguna from './pages/pengguna/DashboardPengguna';
import DashboardAdmin from './pages/petugas/DashboardAdmin';

/**
 * ProtectedRoute — Guard komponen untuk route yang memerlukan autentikasi.
 *
 * MENGAPA menggunakan localStorage, bukan Context/Redux?
 * Untuk scope ujian BNSP, localStorage sudah cukup karena:
 * 1. Tidak membutuhkan library tambahan
 * 2. Data persisten saat browser di-refresh (tidak seperti state React)
 * 3. Sederhana dan mudah di-debug oleh penguji
 *
 * Alur proteksi (cascade check):
 * 1. Jika tidak ada user di localStorage → redirect ke login (/)
 * 2. Jika role tidak sesuai → redirect ke dashboard role yang benar
 * 3. Jika lolos keduanya → render children
 */
const ProtectedRoute = ({ children, allowedRole }: { children: React.ReactNode, allowedRole: string }) => {
  // JSON.parse dengan fallback 'null' (string) agar tidak throw SyntaxError
  // jika localStorage kosong. Hasilnya adalah null atau object user.
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  // Guard pertama: cek apakah sudah login sama sekali
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Guard kedua: cek apakah role cocok dengan halaman yang dituju.
  // Redirect ke dashboard role aktual user agar tidak muncul blank page.
  if (user.role !== allowedRole) {
    return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/pengguna/dashboard'} replace />;
  }

  // Semua guard lolos: render konten halaman yang diminta
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Route publik: halaman login */}
        <Route path="/" element={<Login />} />

        {/* Route terlindungi: hanya untuk role 'pengguna' */}
        <Route
          path="/pengguna/dashboard"
          element={
            <ProtectedRoute allowedRole="pengguna">
              <DashboardPengguna />
            </ProtectedRoute>
          }
        />

        {/* Route terlindungi: hanya untuk role 'admin' */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRole="admin">
              <DashboardAdmin />
            </ProtectedRoute>
          }
        />

        {/* Catch-all: URL tidak dikenal diarahkan ke login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
