/**
 * ============================================================
 * File        : anggotaController.ts
 * Deskripsi   : Controller untuk manajemen data anggota perpustakaan.
 *               Mengambil data dengan JOIN ke tabel users agar
 *               username dan role tersedia dalam satu respons.
 *               (ON DELETE CASCADE di FK anggota.user_id)
 *               sehingga seluruh data terkait terhapus otomatis.
 * Fungsi      :
 *   - getAnggota  : Mengambil seluruh data anggota beserta role user.
 *   - hapusAnggota: Menghapus data anggota (berikut user dan peminjamannya).
 * Pembuat      : Muhammad Ammar Luthfi Azzufar
 * Tanggal Dibuat : 10-08-2026
 * Versi        : 1.0.0
 * ============================================================
 */

import type { Request, Response } from 'express';
import type { RowDataPacket } from 'mysql2';
import db from '../config/db';

/**
 * GET /api/anggota
 * JOIN anggota dengan users diperlukan karena data profil (nama, telepon)
 * ada di tabel anggota, sedangkan kredensial (username, role) ada di tabel users.
 * Menggabungkannya di query SQL lebih efisien daripada dua query terpisah di BE.
 */
export const getAnggota = async (_req: Request, res: Response): Promise<void> => {
  try {
    const query = `SELECT * FROM anggota`;
    const [rows] = await db.query(query);
    res.json(rows);
  } catch {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

/**
 * DELETE /api/anggota/:id
 * Strategi penghapusan: karena FK anggota.user_id → users.id memiliki
 * "ON DELETE CASCADE", menghapus baris di tabel `users` akan otomatis
 * menghapus baris di tabel `anggota` DAN semua `peminjaman` terkait.
 * Kita query user_id dari anggota terlebih dahulu, lalu hapus user-nya
 * (bukan anggota-nya langsung) agar CASCADE bekerja dari root.
 */
export const hapusAnggota = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params; // id merepresentasikan kode anggota

    // Langsung hapus dari tabel anggota, trigger ON DELETE CASCADE 
    // akan otomatis menghapus semua peminjaman terkait.
    await db.query('DELETE FROM anggota WHERE kode = ?', [id]);

    res.json({ message: 'Anggota berhasil dihapus' });
  } catch {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const tambahAnggota = async (req: Request, res: Response): Promise<void> => {
  try {
    const { kode, nama, jenis_kelamin, alamat, no_telepon, email } = req.body;
    
    // Cek apakah kode anggota sudah ada
    const [exist] = await db.query<RowDataPacket[]>('SELECT kode FROM anggota WHERE kode = ?', [kode]);
    if (exist.length > 0) {
      res.status(400).json({ error: 'Kode anggota sudah terdaftar' });
      return;
    }

    await db.query(
      'INSERT INTO anggota (kode, nama, jenis_kelamin, alamat, no_telepon, email) VALUES (?, ?, ?, ?, ?, ?)',
      [kode, nama, jenis_kelamin, alamat, no_telepon, email]
    );

    res.json({ message: 'Anggota berhasil ditambahkan' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const editAnggota = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { nama, jenis_kelamin, alamat, no_telepon, email } = req.body;
    
    await db.query(
      'UPDATE anggota SET nama = ?, jenis_kelamin = ?, alamat = ?, no_telepon = ?, email = ? WHERE kode = ?',
      [nama, jenis_kelamin, alamat, no_telepon, email, id]
    );

    res.json({ message: 'Anggota berhasil diupdate' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
