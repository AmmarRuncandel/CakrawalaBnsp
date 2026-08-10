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
    const query = `
      SELECT a.*, u.username, u.role
      FROM anggota a
      JOIN users u ON a.user_id = u.id
    `;
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
    const { id } = req.params; // id = anggota.id, bukan users.id

    // Cari user_id yang terhubung ke anggota ini sebelum dihapus
    const [anggotaRows] = await db.query<RowDataPacket[]>(
      'SELECT user_id FROM anggota WHERE id = ?',
      [id]
    );

    if (anggotaRows.length > 0) {
      // Hapus dari tabel users → memicu CASCADE ke anggota dan peminjaman
      await db.query('DELETE FROM users WHERE id = ?', [anggotaRows[0].user_id]);
    }

    res.json({ message: 'Anggota berhasil dihapus' });
  } catch {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
