/**
 * ============================================================
 * File        : bukuController.ts
 * Deskripsi   : Controller untuk operasi CRUD entitas buku.
 * Fungsi      :
 *   - getBuku   : Mengambil semua data katalog buku.
 *   - tambahBuku: Menambahkan buku baru ke database.
 *   - hapusBuku : Menghapus buku dari database berdasarkan ID.
 * Pembuat      : Muhammad Ammar Luthfi Azzufar
 * Tanggal Dibuat : 10-08-2026
 * Versi        : 1.0.0
 * ============================================================
 */

import type { Request, Response } from 'express';
import db from '../config/db';

/**
 * GET /api/buku
 * Mengambil semua data buku. Data ini dikirim seluruhnya ke FE
 * agar fungsi cariBuku() dapat melakukan Linear Search secara lokal
 * tanpa query LIKE berulang ke database (sesuai syarat BNSP).
 */
export const getBuku = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [rows] = await db.query('SELECT * FROM buku');
    res.json(rows);
  } catch {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

/**
 * POST /api/buku
 * Menambahkan buku baru. penerbit dan tahun_terbit bersifat opsional
 * (nullable di skema SQL), sehingga kita fallback ke null jika kosong
 * agar database tidak menerima string kosong '' yang bisa menyebabkan
 * inkonsistensi data.
 */
export const tambahBuku = async (req: Request, res: Response): Promise<void> => {
  try {
    const { judul, penulis, penerbit, tahun_terbit, stok } = req.body;

    // Validasi field wajib sebelum menyentuh database
    if (!judul || !penulis || stok === undefined) {
      res.status(400).json({ error: 'Judul, penulis, dan stok wajib diisi' });
      return;
    }
    
    // Parameterized query (?) mencegah SQL Injection, lebih aman dari string concatenation
    await db.query(
      'INSERT INTO buku (judul, penulis, penerbit, tahun_terbit, stok) VALUES (?, ?, ?, ?, ?)',
      [judul, penulis, penerbit || null, tahun_terbit || null, stok]
    );
    res.status(201).json({ message: 'Buku berhasil ditambahkan' });
  } catch {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

/**
 * DELETE /api/buku/:id
 * Menghapus buku. FK constraint "ON DELETE CASCADE" di tabel peminjaman
 * otomatis menghapus semua record peminjaman yang merujuk ke buku ini,
 * menjaga integritas referensial tanpa perlu query tambahan dari sini.
 */
export const hapusBuku = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM buku WHERE id = ?', [id]);
    res.json({ message: 'Buku berhasil dihapus' });
  } catch {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
