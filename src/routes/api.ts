/**
 * ============================================================
 * File        : api.ts
 * Deskripsi   : Definisi seluruh rute API aplikasi perpustakaan.
 *               Menggunakan Express Router untuk memisahkan
 *               routing dari logika server utama (separation of concerns).
 *               Semua route di sini akan diakses dengan prefix "/api".
 * Fungsi      : (Tidak ada fungsi, hanya mapping routing ke controller)
 * Pembuat      : Muhammad Ammar Luthfi Azzufar
 * Tanggal Dibuat : 10-08-2026
 * Versi        : 1.0.0
 * ============================================================
 */

import { Router } from 'express';
import { login } from '../controllers/authController';
import { getBuku, tambahBuku, hapusBuku } from '../controllers/bukuController';
import { getPeminjaman, getPeminjamanByAnggota, pinjamBuku, kembalikanBuku } from '../controllers/peminjamanController';
import { getAnggota, hapusAnggota, tambahAnggota, editAnggota } from '../controllers/anggotaController';

const router = Router();

// ─── AUTH ────────────────────────────────────────────────────
// POST /api/auth/login → Validasi kredensial dan kembalikan data user + anggotaId
router.post('/auth/login', login);

// ─── BUKU ────────────────────────────────────────────────────
// GET    /api/buku      → Ambil semua buku (dipakai cariBuku di FE)
// POST   /api/buku      → Tambah buku baru (petugas only)
// DELETE /api/buku/:id  → Hapus buku berdasarkan id (cascade peminjaman otomatis)
router.get('/buku', getBuku);
router.post('/buku', tambahBuku);
router.delete('/buku/:id', hapusBuku);

// ─── PEMINJAMAN ──────────────────────────────────────────────
// GET /api/peminjaman                    → Semua transaksi (untuk laporan petugas)
// GET /api/peminjaman/anggota/:anggotaId → Riwayat peminjaman per anggota (pengguna)
// POST /api/peminjaman                   → Buat transaksi pinjam buku baru
// PUT  /api/peminjaman/:id/kembali       → Proses pengembalian (trigger denda+stok)
router.get('/peminjaman', getPeminjaman);
router.get('/peminjaman/anggota/:anggotaId', getPeminjamanByAnggota);
router.post('/peminjaman', pinjamBuku);
router.put('/peminjaman/:id/kembali', kembalikanBuku);

// ─── ANGGOTA ─────────────────────────────────────────────────
// GET    /api/anggota      → Semua anggota join tabel users
// POST   /api/anggota      → Tambah anggota baru
// PUT    /api/anggota/:id  → Edit anggota
// DELETE /api/anggota/:id  → Banned anggota (hapus user → cascade anggota+peminjaman)
router.get('/anggota', getAnggota);
router.post('/anggota', tambahAnggota);
router.put('/anggota/:id', editAnggota);
router.delete('/anggota/:id', hapusAnggota);

export default router;
