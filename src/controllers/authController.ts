/**
 * ============================================================
 * File        : authController.ts
 * Deskripsi   : Controller untuk autentikasi pengguna (login).
 *               Memvalidasi kredensial dari tabel `users` dan
 *               mengambil anggotaId dari tabel `anggota` jika
 *               memanggil endpoint peminjaman tanpa query tambahan.
 * Fungsi      :
 *   - login: Memvalidasi username dan password, serta mengembalikan data user.
 * Pembuat      : Muhammad Ammar Luthfi Azzufar
 * Tanggal Dibuat : 10-08-2026
 * Versi        : 1.0.0
 * ============================================================
 */

import type { Request, Response } from 'express';
import type { RowDataPacket } from 'mysql2';
import db from '../config/db';

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      res.status(400).json({ error: 'Username dan password wajib diisi' });
      return;
    }
    
    // Query langsung membandingkan password plain-text sesuai data seeder.
    // Catatan: pada production, sebaiknya menggunakan bcrypt.compare()
    // karena password harus di-hash terlebih dahulu sebelum disimpan.
    const [users] = await db.query<RowDataPacket[]>(
      'SELECT * FROM users WHERE username = ? AND password = ?',
      [username, password]
    );
    
    if (users.length === 0) {
      // HTTP 401 Unauthorized: kredensial valid secara format, tapi salah
      res.status(401).json({ error: 'Username atau password salah' });
      return;
    }
    
    const user = users[0];
    
    // anggotaId hanya relevan untuk role 'pengguna'. Petugas tidak memiliki
    // entri di tabel anggota, sehingga kita skip query ini untuk efisiensi.
    // FE menggunakan anggotaId ini saat melakukan POST /api/peminjaman.
    let anggotaId = null;
    if (user.role === 'pengguna') {
      const [anggota] = await db.query<RowDataPacket[]>(
        'SELECT id FROM anggota WHERE user_id = ?',
        [user.id]
      );
      // Ambil anggota.id jika ada, null jika pengguna belum terdaftar sebagai anggota
      if (anggota.length > 0) anggotaId = anggota[0].id;
    }

    // Kembalikan data minimal yang dibutuhkan FE:
    // id (identitas), username (tampilan), role (routing), anggotaId (peminjaman)
    res.json({
      message: 'Login berhasil',
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        anggotaId
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
