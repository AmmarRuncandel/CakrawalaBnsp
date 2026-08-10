/**
 * ============================================================
 * File        : Login.tsx
 * Deskripsi   : Halaman autentikasi dua-panel (split-screen layout).
 *               Panel kiri berisi branding & ilustrasi (hanya tampil
 *               di layar besar), panel kanan berisi form login.
 *               Mengirim kredensial ke POST /api/auth/login dan
 *               menyimpan data user ke localStorage untuk session.
 * Fungsi      :
 *   - Login      : Komponen utama halaman login.
 *   - handleLogin: Mengambil input form, memanggil API auth, dan me-routing user.
 * Pembuat      : Muhammad Ammar Luthfi Azzufar
 * Tanggal Dibuat : 10-08-2026
 * Versi        : 1.0.0
 * ============================================================
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';
import { FiUser, FiLock, FiBookOpen, FiArrowRight, FiEye, FiEyeOff } from 'react-icons/fi';

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      Swal.fire({ icon: 'warning', title: 'Perhatian', text: 'Username dan Password wajib diisi', confirmButtonColor: '#44A1A4' });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password: password.trim() })
      });
      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('user', JSON.stringify(data.user));
        Swal.fire({
          icon: 'success',
          title: `Selamat datang, ${data.user.username}!`,
          text: `Halo, ${data.user.username}`,
          timer: 1400,
          showConfirmButton: false,
          confirmButtonColor: '#44A1A4',
        }).then(() => {
          navigate(data.user.role === 'admin' ? '/admin/dashboard' : '/pengguna/dashboard');
        });
      } else {
        Swal.fire({ icon: 'error', title: 'Login Gagal', text: data.error || 'Username atau password salah', confirmButtonColor: '#44A1A4' });
      }
    } catch {
      Swal.fire({ icon: 'error', title: 'Koneksi Error', text: 'Tidak dapat terhubung ke server. Pastikan backend berjalan.', confirmButtonColor: '#44A1A4' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#f0f9f9]">
      {/* Left Panel - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#1a3636] relative overflow-hidden flex-col items-center justify-center p-16">
        {/* Abstract circles */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/20 rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-primary/10 rounded-full translate-x-1/3 translate-y-1/3" />
        <div className="absolute top-1/2 right-10 w-32 h-32 bg-primary/30 rounded-full" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative z-10 text-center"
        >
          <div className="w-24 h-24 rounded-3xl bg-primary flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-primary/40 animate-float">
            <FiBookOpen size={44} className="text-white" />
          </div>
          <h1 className="text-4xl font-extrabold text-white mb-4 leading-tight">
            Perpus<span className="text-primary">Cakra</span>
          </h1>
          <p className="text-white/60 text-lg leading-relaxed max-w-xs mx-auto">
            Sistem Informasi Perpustakaan Digital untuk BNSP Junior Programmer
          </p>

          <div className="mt-12 grid grid-cols-3 gap-4">
            {['Kelola Buku', 'Pinjam Mudah', 'Laporan Real-time'].map((f, i) => (
              <div key={i} className="bg-white/10 rounded-2xl p-4 text-center backdrop-blur-sm">
                <p className="text-white text-xs font-medium leading-tight">{f}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-10">
            <div className="inline-flex w-16 h-16 rounded-2xl bg-primary items-center justify-center shadow-lg mb-4">
              <FiBookOpen size={28} className="text-white" />
            </div>
            <h1 className="text-3xl font-extrabold text-gray-800">Perpus<span className="text-primary">Cakra</span></h1>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800">Masuk ke Akun</h2>
            <p className="text-gray-500 mt-1">Gunakan username dan password Anda</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
              <div className="relative">
                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all shadow-sm"
                  placeholder="Contoh: A7X"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="w-full pl-11 pr-12 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all shadow-sm"
                  placeholder="Masukkan password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:bg-primary-dark transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Masuk ke Dashboard <FiArrowRight size={16} /></>
              )}
            </motion.button>
          </form>

          <div className="mt-8 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
            <p className="text-xs font-semibold text-gray-500 mb-2">Akun Demo:</p>
            <div className="space-y-1 text-xs text-gray-500">
              <p><span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-primary font-semibold">admin</span> / <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded">admin123</span> — Admin</p>
              <p><span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-primary font-semibold">AG001</span> / <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded">ahmad@mail.com</span> — Pengguna</p>
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 mt-6 font-medium">Tugas Ujian BNSP Junior Programmer</p>
        </motion.div>
      </div>
    </div>
  );
}
