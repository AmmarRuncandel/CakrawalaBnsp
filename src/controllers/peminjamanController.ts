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
      SELECT p.*, b.judul, a.nama AS nama_lengkap 
      FROM peminjaman p
      JOIN buku b ON p.kode_buku = b.kode
      JOIN anggota a ON p.kode_anggota = a.kode
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
    const { anggotaId } = req.params; // anggotaId disini adalah kode_anggota
    const query = `
      SELECT p.*, b.judul 
      FROM peminjaman p
      JOIN buku b ON p.kode_buku = b.kode
      WHERE p.kode_anggota = ?
    `;
    const [rows] = await db.query(query, [anggotaId]);
    res.json(rows);
  } catch {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

/**
 * POST /api/peminjaman
 * Membuat transaksi peminjaman baru dan secara eksplisit mengurangi stok buku
 * karena trigger MySQL telah dihapus dari skema baru.
 * Tenggat ditetapkan 3 hari dari tanggal pinjam (sesuai aturan perpustakaan).
 */
export const pinjamBuku = async (req: Request, res: Response): Promise<void> => {
  try {
    const { kode_anggota, kode_buku } = req.body;
    if (!kode_anggota || !kode_buku) {
      res.status(400).json({ error: 'kode_anggota dan kode_buku wajib diisi' });
      return;
    }

    const [bukuRows] = await db.query<RowDataPacket[]>(
      'SELECT stok FROM buku WHERE kode = ?',
      [kode_buku]
    );
    if (bukuRows.length === 0 || bukuRows[0].stok <= 0) {
      res.status(400).json({ error: 'Stok buku habis atau buku tidak ditemukan' });
      return;
    }

    const tglPinjam = new Date();
    const tglTenggat = new Date();
    tglTenggat.setDate(tglPinjam.getDate() + 3); 

    const tglPinjamStr = tglPinjam.toISOString().split('T')[0];
    const tglTenggatStr = tglTenggat.toISOString().split('T')[0];
    
    // Generate simple ID, ex: PJ169288123
    const kodePeminjaman = `PJ${Math.floor(Date.now() / 1000)}`;

    await db.query(
      'INSERT INTO peminjaman (kode, kode_anggota, kode_buku, tgl_pinjam, jatuh_tempo, status) VALUES (?, ?, ?, ?, ?, ?)',
      [kodePeminjaman, kode_anggota, kode_buku, tglPinjamStr, tglTenggatStr, 'Dipinjam']
    );

    // Kurangi stok buku secara manual
    await db.query('UPDATE buku SET stok = stok - 1 WHERE kode = ?', [kode_buku]);

    res.status(201).json({ message: 'Buku berhasil dipinjam' });
  } catch {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

/**
 * PUT /api/peminjaman/:id/kembali
 * Memproses pengembalian buku. Menghitung denda secara eksplisit di level backend
 * dan mengembalikan stok buku karena trigger MySQL telah ditiadakan di skema baru.
 * Denda dihitung Rp1000 per hari keterlambatan.
 */
export const kembalikanBuku = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params; // id merepresentasikan kode
    const tglKembali = new Date().toISOString().split('T')[0];

    const [pRows] = await db.query<RowDataPacket[]>('SELECT kode_buku, jatuh_tempo FROM peminjaman WHERE kode = ?', [id]);
    if (pRows.length === 0) {
      res.status(404).json({ error: 'Data peminjaman tidak ditemukan' });
      return;
    }

    const peminjaman = pRows[0];
    const tenggat = new Date(peminjaman.jatuh_tempo).getTime();
    const sekarang = new Date().getTime(); 
    let denda = 0;
    
    if (sekarang > tenggat) {
      denda = Math.floor((sekarang - tenggat) / (1000 * 3600 * 24)) * 1000;
    }

    await db.query(
      'UPDATE peminjaman SET status = ?, tgl_kembali = ?, denda = ? WHERE kode = ?',
      ['Kembali', tglKembali, denda, id]
    );

    // Tambah kembali stok buku
    await db.query('UPDATE buku SET stok = stok + 1 WHERE kode = ?', [peminjaman.kode_buku]);
    res.json({ message: 'Buku berhasil dikembalikan' });
  } catch {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
