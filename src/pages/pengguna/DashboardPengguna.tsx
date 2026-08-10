/**
 * ============================================================
 * File        : DashboardPengguna.tsx
 * Deskripsi   : Halaman dashboard untuk role 'pengguna'. Menampilkan
 *               linear search (cariBuku) serta melihat riwayat
 *               peminjaman mereka sendiri (lengkap dengan
 *               estimasi denda secara real-time). Menggunakan
 *               SweetAlert2 untuk interaksi UI modern.
 * Fungsi      :
 *   - DashboardPengguna  : Komponen utama halaman pengguna.
 *   - fetchBuku          : Mengambil katalog semua buku dari API.
 *   - fetchPeminjaman    : Mengambil riwayat peminjaman spesifik milik user.
 *   - handleSearch       : Memfilter katalog buku berdasarkan keyword.
 *   - handlePinjam       : Meminta persetujuan dan mengirim request pinjam ke API.
 *   - hitungDendaRealtime: Menghitung denda secara instan berdasarkan selisih waktu.
 * Pembuat      : Muhammad Ammar Luthfi Azzufar
 * Tanggal Dibuat : 10-08-2026
 * Versi        : 1.0.0
 * ============================================================
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';
import { FiSearch, FiBookOpen, FiClock, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import DashboardLayout from '../../layouts/DashboardLayout';
import { cariBuku } from '../../utils/algorithms';

/**
 * Interface sesuai schema SQL:
 * tabel buku: id, judul, penulis, penerbit, tahun_terbit, stok
 */
interface Buku {
  id: number;
  judul: string;
  penulis: string;
  penerbit: string;
  tahun_terbit: number;
  stok: number;
}

/**
 * Interface sesuai schema SQL:
 * tabel peminjaman JOIN buku: id, anggota_id, buku_id, tanggal_pinjam,
 * tanggal_tenggat, tanggal_dikembalikan, status, denda, judul
 */
interface Peminjaman {
  id: number;
  judul: string;
  tanggal_pinjam: string;
  tanggal_tenggat: string;
  tanggal_dikembalikan: string | null;
  status: 'dipinjam' | 'dikembalikan';
  denda: number;
}

// Warna cover buku berdasarkan index
const COVER_COLORS = [
  'from-teal-400 to-teal-600',
  'from-blue-400 to-blue-600',
  'from-purple-400 to-purple-600',
  'from-orange-400 to-orange-600',
  'from-pink-400 to-pink-600',
  'from-green-400 to-green-600',
  'from-indigo-400 to-indigo-600',
  'from-red-400 to-red-600',
];

export default function DashboardPengguna() {
  const [activeTab, setActiveTab] = useState('katalog');
  const [semuaBuku, setSemuaBuku] = useState<Buku[]>([]);
  const [bukuDitampilkan, setBukuDitampilkan] = useState<Buku[]>([]);
  const [keyword, setKeyword] = useState('');
  const [peminjaman, setPeminjaman] = useState<Peminjaman[]>([]);
  const [loadingBuku, setLoadingBuku] = useState(true);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchBuku = useCallback(async () => {
    setLoadingBuku(true);
    try {
      const res = await fetch('http://localhost:5000/api/buku');
      if (!res.ok) throw new Error('Network response was not ok');
      const data: Buku[] = await res.json();
      setSemuaBuku(Array.isArray(data) ? data : []);
      setBukuDitampilkan(Array.isArray(data) ? data : []);
    } catch (_err) {
      console.error('Gagal fetch buku:', _err);
      setSemuaBuku([]);
      setBukuDitampilkan([]);
    } finally {
      setLoadingBuku(false);
    }
  }, []);

  const fetchPeminjaman = useCallback(async () => {
    if (!user.anggotaId) {
      setPeminjaman([]);
      return;
    }
    try {
      // GET /api/peminjaman/anggota/:anggotaId — join buku, return judul
      const res = await fetch(`http://localhost:5000/api/peminjaman/anggota/${user.anggotaId}`);
      if (!res.ok) throw new Error('Network response was not ok');
      const data: Peminjaman[] = await res.json();
      setPeminjaman(Array.isArray(data) ? data : []);
    } catch {
      console.error('Gagal fetch peminjaman');
      setPeminjaman([]);
    }
  }, [user.anggotaId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchBuku();
    fetchPeminjaman();
  }, [fetchBuku, fetchPeminjaman]);

  // cariBuku — Linear Search O(n), Syarat Wajib BNSP
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setKeyword(val);
    setBukuDitampilkan(cariBuku(semuaBuku, val));
  };

  const handlePinjam = async (bukuId: number, judulBuku: string) => {
    if (!user.anggotaId) {
      Swal.fire({ icon: 'error', title: 'Tidak dapat meminjam', text: 'Anda belum terdaftar sebagai anggota resmi.', confirmButtonColor: '#44A1A4' });
      return;
    }

    const result = await Swal.fire({
      title: 'Pinjam Buku?',
      html: `<b class="text-gray-800">${judulBuku}</b><br><br><span class="text-sm text-gray-500">Tenggat: <b>3 hari</b> dari sekarang. Denda Rp 1.000/hari jika terlambat.</span>`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#44A1A4',
      cancelButtonColor: '#e5e7eb',
      cancelButtonText: '<span style="color:#374151">Batal</span>',
      confirmButtonText: 'Ya, Pinjam!',
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch('http://localhost:5000/api/peminjaman', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          // anggota_id dan buku_id sesuai kolom tabel peminjaman
          body: JSON.stringify({ anggota_id: user.anggotaId, buku_id: bukuId })
        });
        const data = await res.json();
        if (res.ok) {
          Swal.fire({ icon: 'success', title: 'Berhasil!', text: data.message, timer: 1500, showConfirmButton: false });
          fetchBuku();
          fetchPeminjaman();
          setActiveTab('dipinjam');
        } else {
          Swal.fire({ icon: 'error', title: 'Gagal', text: data.error, confirmButtonColor: '#44A1A4' });
        }
      } catch {
        Swal.fire({ icon: 'error', title: 'Error', text: 'Terjadi kesalahan sistem.', confirmButtonColor: '#44A1A4' });
      }
    }
  };

  // Hitung denda realtime di FE (sebelum dikembalikan): O(1)
  const hitungDendaRealtime = (tanggal_tenggat: string): number => {
    const tenggat = new Date(tanggal_tenggat).getTime();
    const sekarang = new Date().getTime();
    if (sekarang > tenggat) {
      return Math.floor((sekarang - tenggat) / (1000 * 3600 * 24)) * 1000;
    }
    return 0;
  };

  const pinjamAktif = peminjaman.filter(p => p.status === 'dipinjam');
  const pinjamSelesai = peminjaman.filter(p => p.status === 'dikembalikan');

  return (
    <DashboardLayout
      role="pengguna"
      title={activeTab === 'katalog' ? 'Katalog Buku' : 'Riwayat Peminjaman'}
      subtitle={activeTab === 'katalog' ? `${semuaBuku.length} buku tersedia` : `${pinjamAktif.length} sedang dipinjam`}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {/* ─── TAB KATALOG ─── */}
      {activeTab === 'katalog' && (
        <div className="space-y-6">
          {/* Search */}
          <div className="relative max-w-lg">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
              placeholder="Cari judul atau penulis buku..."
              value={keyword}
              onChange={handleSearch}
            />
            {keyword && (
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                {bukuDitampilkan.length} hasil
              </span>
            )}
          </div>

          {/* Grid Buku */}
          {loadingBuku ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
                  <div className="h-40 bg-gray-200" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                    <div className="h-8 bg-gray-100 rounded-lg mt-3" />
                  </div>
                </div>
              ))}
            </div>
          ) : bukuDitampilkan.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-gray-400">
              <FiSearch size={48} className="mb-4 opacity-30" />
              <p className="text-lg font-medium">Buku tidak ditemukan</p>
              <p className="text-sm">Coba kata kunci lain</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
              {bukuDitampilkan.map((buku, index) => (
                <motion.div
                  key={buku.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index * 0.04, 0.5), duration: 0.3 }}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col group"
                >
                  {/* Cover */}
                  <div className={`h-40 bg-gradient-to-br ${COVER_COLORS[index % COVER_COLORS.length]} flex flex-col items-center justify-center p-4 relative`}>
                    <FiBookOpen size={36} className="text-white/70 mb-2" />
                    <p className="text-white text-xs font-semibold text-center leading-tight line-clamp-2 opacity-90">
                      {buku.judul}
                    </p>
                    {buku.stok === 0 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white text-xs font-bold bg-red-500 px-2 py-1 rounded-full">Habis</span>
                      </div>
                    )}
                  </div>
                  {/* Info */}
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="text-sm font-bold text-gray-800 line-clamp-2 leading-tight mb-1">{buku.judul}</h3>
                    <p className="text-xs text-gray-500 mb-1">{buku.penulis}</p>
                    <p className="text-xs text-gray-400 mb-3">{buku.penerbit} · {buku.tahun_terbit}</p>
                    <div className="mt-auto flex items-center justify-between">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${buku.stok > 0 ? 'bg-teal-50 text-primary' : 'bg-red-50 text-red-500'}`}>
                        Stok: {buku.stok}
                      </span>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handlePinjam(buku.id, buku.judul)}
                        disabled={buku.stok === 0}
                        className="px-3 py-1.5 bg-primary text-white text-xs rounded-lg font-semibold hover:bg-primary-dark transition-colors disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed shadow-sm shadow-primary/30"
                      >
                        Pinjam
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── TAB RIWAYAT ─── */}
      {activeTab === 'dipinjam' && (
        <div className="space-y-6">
          {/* Aktif */}
          <div>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Sedang Dipinjam ({pinjamAktif.length})</h3>
            {pinjamAktif.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center text-gray-400 border border-dashed border-gray-200">
                <FiBookOpen size={36} className="mx-auto mb-2 opacity-30" />
                <p>Tidak ada buku yang sedang dipinjam</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pinjamAktif.map(p => {
                  const denda = hitungDendaRealtime(p.tanggal_tenggat);
                  const isTelat = denda > 0;
                  return (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`bg-white rounded-2xl p-5 flex items-start justify-between gap-4 border ${isTelat ? 'border-red-200 bg-red-50/50' : 'border-gray-100'} shadow-sm`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isTelat ? 'bg-red-100 text-red-500' : 'bg-teal-100 text-primary'}`}>
                          {isTelat ? <FiAlertCircle size={20} /> : <FiClock size={20} />}
                        </div>
                        <div>
                          <p className="font-bold text-gray-800">{p.judul}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Dipinjam: {new Date(p.tanggal_pinjam).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                          <p className={`text-xs mt-0.5 font-medium ${isTelat ? 'text-red-500' : 'text-gray-500'}`}>
                            Tenggat: {new Date(p.tanggal_tenggat).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        {isTelat ? (
                          <>
                            <p className="text-xs text-red-400 font-medium">Denda Berjalan</p>
                            <p className="text-red-600 font-extrabold text-lg">Rp {denda.toLocaleString('id-ID')}</p>
                          </>
                        ) : (
                          <span className="inline-block px-3 py-1 bg-teal-50 text-primary text-xs font-semibold rounded-full border border-primary/20">
                            Tepat Waktu
                          </span>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Selesai */}
          {pinjamSelesai.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Riwayat Dikembalikan ({pinjamSelesai.length})</h3>
              <div className="space-y-3">
                {pinjamSelesai.map(p => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-white rounded-2xl p-5 flex items-center justify-between gap-4 border border-gray-100 shadow-sm opacity-70"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-green-100 text-green-600 flex items-center justify-center">
                        <FiCheckCircle size={20} />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-700">{p.judul}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Dikembalikan: {p.tanggal_dikembalikan ? new Date(p.tanggal_dikembalikan).toLocaleDateString('id-ID') : '-'}
                        </p>
                      </div>
                    </div>
                    {p.denda > 0 ? (
                      <span className="text-sm font-bold text-red-500">Rp {p.denda.toLocaleString('id-ID')}</span>
                    ) : (
                      <span className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded-full font-medium">Tepat Waktu</span>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
