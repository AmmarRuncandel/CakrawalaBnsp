/**
 * ============================================================
 * File        : DashboardPetugas.tsx
 * Deskripsi   : Halaman dashboard untuk role 'petugas'. Menyediakan
 *               4 tab: Manajemen Buku (CRUD + cariBuku O(n)),
 *               Data Anggota (lihat & banned), Proses Pengembalian
 *               (peminjaman aktif diurutkan urutkanPeminjaman O(n log n)
 *               + histori keterlambatan). Semua aksi menggunakan
 *               SweetAlert2 untuk konfirmasi dan notifikasi.
 * Fungsi      :
 *   - hitungDenda       : Fungsi O(1) menghitung nilai denda berdasarkan selisih waktu.
 *   - StatCard          : Sub-komponen UI untuk kartu statistik.
 *   - DashboardPetugas  : Komponen utama halaman petugas.
 *   - fetchData         : Mengambil seluruh data buku, anggota, & peminjaman dari API.
 *   - handleCariBuku    : Memfilter daftar buku menggunakan fungsi cariBuku().
 *   - handleTambahBuku  : Menyimpan entri buku baru ke database.
 *   - handleHapusBuku   : Menghapus buku dari sistem beserta peringatan SweetAlert.
 *   - handleHapusAnggota: Melakukan Banned/penghapusan user dan semua datanya.
 *   - handlePengembalian: Mengkonfirmasi dan memproses pengembalian peminjaman.
 *   - getTitleByTab     : Mengembalikan judul header berdasarkan tab aktif.
 *   - getSubtitleByTab  : Mengembalikan sub-judul header berdasarkan tab aktif.
 * Pembuat      : Muhammad Ammar Luthfi Azzufar
 * Tanggal Dibuat : 10-08-2026
 * Versi        : 1.0.0
 * ============================================================
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';
import {
  FiSearch, FiTrash2, FiPlus, FiCheck, FiBook,
  FiAlertTriangle, FiUsers, FiBarChart2, FiClock
} from 'react-icons/fi';
import DashboardLayout from '../../layouts/DashboardLayout';
import { urutkanPeminjaman, cariBuku } from '../../utils/algorithms';

/**
 * Interfaces sesuai schema SQL seeder:
 * buku: id, judul, penulis, penerbit, tahun_terbit, stok
 * anggota JOIN users: id, user_id, nama_lengkap, nomor_telepon, alamat, tanggal_bergabung, username, role
 * peminjaman JOIN buku JOIN anggota: semua kolom + judul + nama_lengkap
 */
interface Buku {
  id: number;
  judul: string;
  penulis: string;
  penerbit: string;
  tahun_terbit: number;
  stok: number;
}

interface Anggota {
  id: number;
  user_id: number;
  nama_lengkap: string;
  nomor_telepon: string;
  alamat: string;
  tanggal_bergabung: string;
  username: string;
  role: string;
}

interface Peminjaman {
  id: number;
  anggota_id: number;
  buku_id: number;
  judul: string;
  nama_lengkap: string;
  tanggal_pinjam: string;
  tanggal_tenggat: string;
  tanggal_dikembalikan: string | null;
  status: 'dipinjam' | 'dikembalikan';
  denda: number;
}

interface FormBuku {
  judul: string;
  penulis: string;
  penerbit: string;
  tahun_terbit: string;
  stok: number;
}

// Hitung denda realtime O(1)
const hitungDenda = (tanggal_tenggat: string): number => {
  const tenggat = new Date(tanggal_tenggat).getTime();
  const sekarang = new Date().getTime();
  if (sekarang > tenggat) {
    return Math.floor((sekarang - tenggat) / (1000 * 3600 * 24)) * 1000;
  }
  return 0;
};

// Stat Card
const StatCard = ({ label, value, icon, color }: { label: string; value: number | string; icon: React.ReactNode; color: string }) => (
  <div className={`bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4`}>
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-2xl font-extrabold text-gray-800">{value}</p>
      <p className="text-xs text-gray-500 font-medium">{label}</p>
    </div>
  </div>
);

export default function DashboardPetugas() {
  const [activeTab, setActiveTab] = useState('buku');
  const [buku, setBuku] = useState<Buku[]>([]);
  const [bukuTampil, setBukuTampil] = useState<Buku[]>([]);
  const [keywordBuku, setKeywordBuku] = useState('');
  const [anggota, setAnggota] = useState<Anggota[]>([]);
  const [peminjaman, setPeminjaman] = useState<Peminjaman[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formBuku, setFormBuku] = useState<FormBuku>({
    judul: '', penulis: '', penerbit: '', tahun_terbit: '', stok: 0
  });

  const fetchData = useCallback(async () => {
    try {
      // Fetch paralel ketiga endpoint sekaligus untuk efisiensi.
      // Setiap response diperiksa: jika non-OK (mis. 500), fallback ke array kosong
      // agar render tidak crash saat .filter() / .map() dipanggil pada nilai undefined.
      const [resBuku, resAnggota, resPinjam] = await Promise.all([
        fetch('http://localhost:5000/api/buku'),
        fetch('http://localhost:5000/api/anggota'),
        fetch('http://localhost:5000/api/peminjaman'),
      ]);

      const dataBuku    = resBuku.ok    ? await resBuku.json()    : [];
      const dataAnggota = resAnggota.ok ? await resAnggota.json() : [];
      const dataPinjam  = resPinjam.ok  ? await resPinjam.json()  : [];

      // Pastikan nilai yang disimpan ke state selalu array (guard terhadap response error JSON)
      setBuku(Array.isArray(dataBuku)    ? dataBuku    : []);
      setBukuTampil(Array.isArray(dataBuku) ? dataBuku : []);
      setAnggota(Array.isArray(dataAnggota) ? dataAnggota : []);
      setPeminjaman(Array.isArray(dataPinjam) ? dataPinjam : []);
    } catch (_err) {
      // Jika fetch sama sekali gagal (backend mati), isi state dengan array kosong
      // agar komponen tetap render dengan tampilan "kosong" bukan crash putih
      console.error('Fetch error:', _err);
      setBuku([]);
      setBukuTampil([]);
      setAnggota([]);
      setPeminjaman([]);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, [fetchData]);

  // cariBuku — Linear Search O(n), Syarat Wajib BNSP
  const handleCariBuku = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKeywordBuku(e.target.value);
    setBukuTampil(cariBuku(buku, e.target.value));
  };

  const handleTambahBuku = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/buku', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // body sesuai kolom tabel buku
        body: JSON.stringify({
          judul: formBuku.judul,
          penulis: formBuku.penulis,
          penerbit: formBuku.penerbit,
          tahun_terbit: formBuku.tahun_terbit ? Number(formBuku.tahun_terbit) : null,
          stok: formBuku.stok,
        }),
      });
      if (res.ok) {
        Swal.fire({ icon: 'success', title: 'Buku Ditambahkan!', timer: 1200, showConfirmButton: false });
        setFormBuku({ judul: '', penulis: '', penerbit: '', tahun_terbit: '', stok: 0 });
        setShowForm(false);
        fetchData();
      } else {
        const d = await res.json();
        Swal.fire({ icon: 'error', title: 'Gagal', text: d.error, confirmButtonColor: '#44A1A4' });
      }
    } catch {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Gagal menambah buku', confirmButtonColor: '#44A1A4' });
    }
  };

  const handleHapusBuku = async (id: number, judul: string) => {
    const result = await Swal.fire({
      title: 'Hapus Buku?',
      html: `<span class="text-gray-600">Buku <b>${judul}</b> akan dihapus permanen.</span>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#e5e7eb',
      cancelButtonText: '<span style="color:#374151">Batal</span>',
      confirmButtonText: 'Hapus!',
      reverseButtons: true,
    });
    if (result.isConfirmed) {
      try {
        await fetch(`http://localhost:5000/api/buku/${id}`, { method: 'DELETE' });
        Swal.fire({ icon: 'success', title: 'Terhapus!', timer: 1200, showConfirmButton: false });
        fetchData();
      } catch {
        Swal.fire({ icon: 'error', title: 'Gagal menghapus', confirmButtonColor: '#44A1A4' });
      }
    }
  };

  const handleHapusAnggota = async (id: number, nama: string) => {
    const result = await Swal.fire({
      title: 'Banned Anggota?',
      html: `<span class="text-gray-600">Akun <b>${nama}</b> dan semua datanya akan dihapus permanen (ON DELETE CASCADE).</span>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#e5e7eb',
      cancelButtonText: '<span style="color:#374151">Batal</span>',
      confirmButtonText: 'Ya, Banned!',
      reverseButtons: true,
    });
    if (result.isConfirmed) {
      try {
        await fetch(`http://localhost:5000/api/anggota/${id}`, { method: 'DELETE' });
        Swal.fire({ icon: 'success', title: 'Berhasil!', timer: 1200, showConfirmButton: false });
        fetchData();
      } catch {
        Swal.fire({ icon: 'error', title: 'Gagal', confirmButtonColor: '#44A1A4' });
      }
    }
  };

  const handlePengembalian = async (p: Peminjaman) => {
    const estimasiDenda = hitungDenda(p.tanggal_tenggat);
    const result = await Swal.fire({
      title: 'Proses Pengembalian',
      html: `
        <div style="text-align:left;padding:8px 0">
          <p style="font-size:13px;color:#6b7280;margin-bottom:4px">Buku</p>
          <p style="font-weight:700;color:#1a2e2e">${p.judul}</p>
          <p style="font-size:13px;color:#6b7280;margin:12px 0 4px">Peminjam</p>
          <p style="font-weight:700;color:#1a2e2e">${p.nama_lengkap}</p>
          <div style="margin-top:16px;padding:12px;background:${estimasiDenda > 0 ? '#fef2f2' : '#f0f9f9'};border-radius:12px;text-align:center">
            ${estimasiDenda > 0
              ? `<p style="color:#ef4444;font-size:12px;font-weight:600">Denda Keterlambatan</p><p style="color:#dc2626;font-size:24px;font-weight:800">Rp ${estimasiDenda.toLocaleString('id-ID')}</p>`
              : `<p style="color:#44A1A4;font-size:14px;font-weight:700;display:flex;align-items:center;justify-content:center;gap:6px"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#44A1A4" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Tepat Waktu — Tidak Ada Denda</p>`
            }
          </div>
        </div>
      `,
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#44A1A4',
      cancelButtonColor: '#e5e7eb',
      cancelButtonText: '<span style="color:#374151">Batal</span>',
      confirmButtonText: 'Konfirmasi Kembali',
      reverseButtons: true,
    });
    if (result.isConfirmed) {
      try {
        // PUT /api/peminjaman/:id/kembali — trigger SQL otomatis hitung denda & tambah stok
        await fetch(`http://localhost:5000/api/peminjaman/${p.id}/kembali`, { method: 'PUT' });
        Swal.fire({ icon: 'success', title: 'Buku Dikembalikan!', timer: 1200, showConfirmButton: false });
        fetchData();
      } catch {
        Swal.fire({ icon: 'error', title: 'Error', confirmButtonColor: '#44A1A4' });
      }
    }
  };

  // urutkanPeminjaman — Timsort O(n log n), Syarat Wajib BNSP
  const pinjamAktif = urutkanPeminjaman(peminjaman.filter(p => p.status === 'dipinjam'));
  const pinjamTelat = [...peminjaman]
    .filter(p => p.status === 'dikembalikan' && p.denda > 0)
    .sort((a, b) => new Date(b.tanggal_dikembalikan!).getTime() - new Date(a.tanggal_dikembalikan!).getTime());

  const getTitleByTab = () => {
    const map: Record<string, string> = {
      buku: 'Manajemen Buku', anggota: 'Data Anggota', pengembalian: 'Proses Pengembalian', laporan: 'Laporan'
    };
    return map[activeTab] || '';
  };

  const getSubtitleByTab = () => {
    const map: Record<string, string> = {
      buku: `${buku.length} judul buku`,
      anggota: `${anggota.length} anggota terdaftar`,
      pengembalian: `${pinjamAktif.length} menunggu`,
      laporan: 'Analitik peminjaman',
    };
    return map[activeTab] || '';
  };

  return (
    <DashboardLayout
      role="petugas"
      title={getTitleByTab()}
      subtitle={getSubtitleByTab()}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {/* ─── TAB BUKU ─── */}
      {activeTab === 'buku' && (
        <div className="space-y-5">
          {/* Stats Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Buku" value={buku.length} icon={<FiBook size={22} className="text-primary" />} color="bg-teal-50" />
            <StatCard label="Total Stok" value={buku.reduce((a, b) => a + b.stok, 0)} icon={<FiBarChart2 size={22} className="text-blue-500" />} color="bg-blue-50" />
            <StatCard label="Stok Habis" value={buku.filter(b => b.stok === 0).length} icon={<FiAlertTriangle size={22} className="text-orange-500" />} color="bg-orange-50" />
            <StatCard label="Dipinjam Aktif" value={pinjamAktif.length} icon={<FiClock size={22} className="text-purple-500" />} color="bg-purple-50" />
          </div>

          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="relative flex-1 max-w-xs">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
              <input
                type="text"
                placeholder="Cari buku..."
                className="pl-10 pr-4 py-2.5 w-full bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all shadow-sm"
                value={keywordBuku}
                onChange={handleCariBuku}
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl shadow-sm shadow-primary/30 hover:bg-primary-dark transition-colors"
            >
              <FiPlus size={16} />
              Tambah Buku
            </motion.button>
          </div>

          {/* Form Tambah Buku */}
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-6 border border-primary/20 shadow-sm"
            >
              <h3 className="font-bold text-gray-800 mb-5">Form Tambah Buku Baru</h3>
              <form onSubmit={handleTambahBuku} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Judul Buku *</label>
                  <input required type="text" placeholder="Mastering Next.js" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all" value={formBuku.judul} onChange={e => setFormBuku({ ...formBuku, judul: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Penulis *</label>
                  <input required type="text" placeholder="Nama Penulis" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all" value={formBuku.penulis} onChange={e => setFormBuku({ ...formBuku, penulis: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Penerbit</label>
                  <input type="text" placeholder="Nama Penerbit" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all" value={formBuku.penerbit} onChange={e => setFormBuku({ ...formBuku, penerbit: e.target.value })} />
                </div>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Tahun Terbit</label>
                    <input type="number" min="1900" max="2100" placeholder="2024" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all" value={formBuku.tahun_terbit} onChange={e => setFormBuku({ ...formBuku, tahun_terbit: e.target.value })} />
                  </div>
                  <div className="w-28">
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Stok *</label>
                    <input required type="number" min="0" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all" value={formBuku.stok} onChange={e => setFormBuku({ ...formBuku, stok: Number(e.target.value) })} />
                  </div>
                </div>
                <div className="sm:col-span-2 flex justify-end gap-3">
                  <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">Batal</button>
                  <button type="submit" className="px-5 py-2.5 text-sm font-semibold text-white bg-primary rounded-xl hover:bg-primary-dark transition-colors shadow-sm shadow-primary/30">Simpan</button>
                </div>
              </form>
            </motion.div>
          )}

          {/* Tabel Buku */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Judul</th>
                    <th className="text-left px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Penulis</th>
                    <th className="text-left px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">Penerbit</th>
                    <th className="text-center px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Stok</th>
                    <th className="text-center px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {bukuTampil.map(b => (
                    <tr key={b.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-5 py-4 font-semibold text-gray-800">{b.judul}</td>
                      <td className="px-5 py-4 text-gray-500">{b.penulis}</td>
                      <td className="px-5 py-4 text-gray-400 hidden md:table-cell">{b.penerbit || '—'}</td>
                      <td className="px-5 py-4 text-center">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${b.stok > 0 ? 'bg-teal-50 text-primary' : 'bg-red-50 text-red-500'}`}>
                          {b.stok}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <button onClick={() => handleHapusBuku(b.id, b.judul)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                          <FiTrash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {bukuTampil.length === 0 && (
                    <tr><td colSpan={5} className="px-5 py-12 text-center text-gray-400">Tidak ada buku ditemukan</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB ANGGOTA ─── */}
      {activeTab === 'anggota' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <StatCard label="Total Anggota" value={anggota.length} icon={<FiUsers size={22} className="text-primary" />} color="bg-teal-50" />
            <StatCard label="Sedang Meminjam" value={pinjamAktif.length} icon={<FiClock size={22} className="text-orange-500" />} color="bg-orange-50" />
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Nama</th>
                    <th className="text-left px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Username</th>
                    <th className="text-left px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Telepon</th>
                    <th className="text-left px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Tgl Bergabung</th>
                    <th className="text-center px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {anggota.map(a => (
                    <tr key={a.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs uppercase flex-shrink-0">
                            {a.nama_lengkap.charAt(0)}
                          </div>
                          <span className="font-semibold text-gray-800">{a.nama_lengkap}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-gray-500 font-mono text-xs">{a.username}</td>
                      <td className="px-5 py-4 text-gray-500 hidden sm:table-cell">{a.nomor_telepon}</td>
                      <td className="px-5 py-4 text-gray-400 hidden lg:table-cell">{new Date(a.tanggal_bergabung).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                      <td className="px-5 py-4 text-center">
                        <button onClick={() => handleHapusAnggota(a.id, a.nama_lengkap)} className="px-3 py-1.5 bg-red-50 text-red-500 text-xs font-semibold rounded-lg hover:bg-red-100 transition-colors">
                          Banned
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB PENGEMBALIAN ─── */}
      {activeTab === 'pengembalian' && (
        <div className="space-y-4">
          {pinjamAktif.length === 0 ? (
            <div className="bg-white rounded-2xl p-16 text-center border border-dashed border-gray-200">
              <FiCheck size={48} className="mx-auto mb-3 text-primary opacity-30" />
              <p className="text-gray-500 font-medium">Tidak ada peminjaman aktif</p>
            </div>
          ) : (
            pinjamAktif.map(p => {
              const denda = hitungDenda(p.tanggal_tenggat);
              const isTelat = denda > 0;
              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`bg-white rounded-2xl p-5 border ${isTelat ? 'border-red-200' : 'border-gray-100'} shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isTelat ? 'bg-red-100 text-red-500' : 'bg-teal-100 text-primary'}`}>
                      {isTelat ? <FiAlertTriangle size={18} /> : <FiClock size={18} />}
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">{p.judul}</p>
                      <p className="text-sm text-gray-500 mt-0.5">Peminjam: <span className="font-semibold text-gray-700">{p.nama_lengkap}</span></p>
                      <p className={`text-xs mt-1 ${isTelat ? 'text-red-500 font-semibold' : 'text-gray-400'}`}>
                        Tenggat: {new Date(p.tanggal_tenggat).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        {isTelat && ` — TERLAMBAT`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {isTelat && (
                      <div className="text-right">
                        <p className="text-xs text-red-400">Est. Denda</p>
                        <p className="text-lg font-extrabold text-red-600">Rp {denda.toLocaleString('id-ID')}</p>
                      </div>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handlePengembalian(p)}
                      className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-dark transition-colors shadow-sm shadow-primary/30"
                    >
                      <FiCheck size={15} /> Proses
                    </motion.button>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      )}

      {/* ─── TAB LAPORAN ─── */}
      {activeTab === 'laporan' && (
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Dipinjam Aktif" value={pinjamAktif.length} icon={<FiClock size={22} className="text-primary" />} color="bg-teal-50" />
            <StatCard label="Pernah Terlambat" value={pinjamTelat.length} icon={<FiAlertTriangle size={22} className="text-red-500" />} color="bg-red-50" />
            <StatCard label="Total Anggota" value={anggota.length} icon={<FiUsers size={22} className="text-blue-500" />} color="bg-blue-50" />
            <StatCard label="Total Buku" value={buku.length} icon={<FiBook size={22} className="text-purple-500" />} color="bg-purple-50" />
          </div>

          {/* Peminjaman Aktif — sorted by urutkanPeminjaman O(n log n) */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
              <div className="w-3 h-3 rounded-full bg-primary"></div>
              <h3 className="font-bold text-gray-800 text-sm">Peminjaman Aktif — Diurutkan Deadline Terdekat <span className="text-xs text-gray-400 font-normal">(awasi peminjaman pengguna)</span></h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-50 bg-gray-50">
                    <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Buku</th>
                    <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Peminjam</th>
                    <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Tenggat</th>
                    <th className="text-right px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Est. Denda</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {pinjamAktif.map(p => {
                    const denda = hitungDenda(p.tanggal_tenggat);
                    return (
                      <tr key={p.id} className="hover:bg-gray-50/80">
                        <td className="px-5 py-3 font-semibold text-gray-800">{p.judul}</td>
                        <td className="px-5 py-3 text-gray-500 hidden sm:table-cell">{p.nama_lengkap}</td>
                        <td className="px-5 py-3">
                          <span className={`text-xs font-semibold ${denda > 0 ? 'text-red-500' : 'text-gray-500'}`}>
                            {new Date(p.tanggal_tenggat).toLocaleDateString('id-ID')}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right">
                          {denda > 0 ? <span className="text-red-600 font-bold">Rp {denda.toLocaleString('id-ID')}</span> : <span className="text-gray-300">—</span>}
                        </td>
                      </tr>
                    );
                  })}
                  {pinjamAktif.length === 0 && <tr><td colSpan={4} className="px-5 py-10 text-center text-gray-400">Tidak ada peminjaman aktif</td></tr>}
                </tbody>
              </table>
            </div>
          </div>

          {/* Histori Keterlambatan */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <h3 className="font-bold text-gray-800 text-sm">Histori Keterlambatan — Terbaru ke Terlama</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-50 bg-gray-50">
                    <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Peminjam</th>
                    <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Buku</th>
                    <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Tgl Kembali</th>
                    <th className="text-right px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Denda Dibayar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {pinjamTelat.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50/80">
                      <td className="px-5 py-3 font-semibold text-gray-800">{p.nama_lengkap}</td>
                      <td className="px-5 py-3 text-gray-500 hidden sm:table-cell">{p.judul}</td>
                      <td className="px-5 py-3 text-gray-500">{p.tanggal_dikembalikan ? new Date(p.tanggal_dikembalikan).toLocaleDateString('id-ID') : '—'}</td>
                      <td className="px-5 py-3 text-right font-bold text-red-600">Rp {p.denda.toLocaleString('id-ID')}</td>
                    </tr>
                  ))}
                  {pinjamTelat.length === 0 && <tr><td colSpan={4} className="px-5 py-10 text-center text-gray-400">Belum ada histori keterlambatan</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}


