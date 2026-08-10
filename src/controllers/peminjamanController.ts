/**
 * ============================================================
 * File        : peminjamanController.ts
 * Deskripsi   : Controller untuk semua operasi transaksi peminjaman
 *               buku. Meliputi: ambil semua data, ambil per anggota,
 *               buat peminjaman baru, dan proses pengembalian.
 *               MySQL (trg_hitung_denda & trg_tambah_stok_buku)
 *               sehingga logika bisnis tersebut berada di level DB.
 * Fungsi      :
 *   - getPeminjaman         : Mengambil semua data peminjaman (untuk petugas).
 *   - getPeminjamanByAnggota: Mengambil data peminjaman milik satu anggota.
 *   - pinjamBuku            : Membuat record peminjaman baru (mengurangi stok).
 *   - kembalikanBuku        : Mengubah status menjadi dikembalikan (memicu trigger denda/stok).
 * Pembuat      : Muhammad Ammar Luthfi Azzufar
 * Tanggal Dibuat : 10-08-2026
 * Versi        : 1.0.0
 * ============================================================
 */

import type { Request, Response } from 'express';
import type { RowDataPacket } from 'mysql2';
import db from '../config/db';

/**
 * GET /api/peminjaman
 * Mengambil semua transaksi peminjaman dengan JOIN ke buku dan anggota.
 * JOIN dilakukan di sini agar FE mendapat `judul` dan `nama_lengkap`
 * dalam satu response, mengurangi jumlah request dari FE ke BE.
 */
export const getPeminjaman = async (_req: Request, res: Response): Promise<void> => {
  try {
    const query = `
      SELECT p.*, b.judul, a.nama_lengkap 
      FROM peminjaman p
      JOIN buku b ON p.buku_id = b.id
      JOIN anggota a ON p.anggota_id = a.id
    `;
    const [rows] = await db.query(query);
    res.json(rows);
  } catch {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

/**
 * GET /api/peminjaman/anggota/:anggotaId
 * Mengambil riwayat peminjaman untuk satu anggota tertentu.
 * Digunakan di dashboard pengguna agar mereka hanya melihat data miliknya,
 * bukan seluruh data semua anggota (prinsip least privilege).
 */
export const getPeminjamanByAnggota = async (req: Request, res: Response): Promise<void> => {
  try {
    const { anggotaId } = req.params;
    const query = `
      SELECT p.*, b.judul 
      FROM peminjaman p
      JOIN buku b ON p.buku_id = b.id
      WHERE p.anggota_id = ?
    `;
    const [rows] = await db.query(query, [anggotaId]);
    res.json(rows);
  } catch {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

/**
 * POST /api/peminjaman
 * Membuat transaksi peminjaman baru. Stok buku TIDAK dikurangi di sini
 * karena sudah ditangani oleh TRIGGER MySQL (trg_kurangi_stok_buku)
 * yang terpicu AFTER INSERT pada tabel peminjaman — memastikan
 * konsistensi stok bahkan jika ada akses langsung ke DB.
 * Tenggat ditetapkan 3 hari dari tanggal pinjam (sesuai aturan perpustakaan).
 */
export const pinjamBuku = async (req: Request, res: Response): Promise<void> => {
  try {
    const { anggota_id, buku_id } = req.body;
    if (!anggota_id || !buku_id) {
      res.status(400).json({ error: 'anggota_id dan buku_id wajib diisi' });
      return;
    }

    // Cek stok sebelum insert untuk memberikan error yang lebih informatif.
    // Pengecekan di BE ini melengkapi constraint `CHECK (stok >= 0)` di DB,
    // karena constraint DB tidak memberikan pesan error yang ramah pengguna.
    const [bukuRows] = await db.query<RowDataPacket[]>(
      'SELECT stok FROM buku WHERE id = ?',
      [buku_id]
    );
    if (bukuRows.length === 0 || bukuRows[0].stok <= 0) {
      res.status(400).json({ error: 'Stok buku habis atau buku tidak ditemukan' });
      return;
    }

    // Kalkulasi tanggal: gunakan UTC untuk menghindari masalah timezone
    // antara server (mungkin UTC) dan database (mungkin WIB/UTC+7).
    // toISOString() selalu menghasilkan format YYYY-MM-DD yang diterima kolom DATE MySQL.
    const tglPinjam = new Date();
    const tglTenggat = new Date();
    tglTenggat.setDate(tglPinjam.getDate() + 3); // Peminjaman maksimal 3 hari

    const tglPinjamStr = tglPinjam.toISOString().split('T')[0];
    const tglTenggatStr = tglTenggat.toISOString().split('T')[0];

    await db.query(
      'INSERT INTO peminjaman (anggota_id, buku_id, tanggal_pinjam, tanggal_tenggat) VALUES (?, ?, ?, ?)',
      [anggota_id, buku_id, tglPinjamStr, tglTenggatStr]
    );
    res.status(201).json({ message: 'Buku berhasil dipinjam' });
  } catch {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

/**
 * PUT /api/peminjaman/:id/kembali
 * Memproses pengembalian buku. Hanya mengupdate status dan tanggal_dikembalikan.
 * Kalkulasi denda dan pengembalian stok diserahkan sepenuhnya ke TRIGGER MySQL:
 * - trg_hitung_denda    : BEFORE UPDATE → hitung denda berdasarkan selisih tanggal
 * - trg_tambah_stok_buku: AFTER UPDATE  → increment stok buku yang dikembalikan
 * Pendekatan ini memastikan denda selalu akurat meski diupdate langsung via SQL CLI.
 */
export const kembalikanBuku = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    // tanggal_dikembalikan = hari ini, digunakan trigger untuk menghitung denda
    const tglKembali = new Date().toISOString().split('T')[0];

    await db.query(
      'UPDATE peminjaman SET status = ?, tanggal_dikembalikan = ? WHERE id = ?',
      ['dikembalikan', tglKembali, id]
    );
    res.json({ message: 'Buku berhasil dikembalikan' });
  } catch {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
