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
    
    // Cek tabel users (admin) terlebih dahulu
    const [users] = await db.query<RowDataPacket[]>(
      'SELECT * FROM users WHERE username = ? AND password = SHA2(?, 256)',
      [username, password]
    );
    
    if (users.length > 0) {
      const user = users[0];
      res.json({
        message: 'Login berhasil (Admin)',
        user: {
          id: user.username,
          username: user.nama_petugas,
          role: 'admin',
          anggotaId: null
        }
      });
      return;
    }

    // Jika tidak ditemukan di admin, cek tabel anggota (pengguna)
    const [anggota] = await db.query<RowDataPacket[]>(
      'SELECT * FROM anggota WHERE kode = ? AND email = ?',
      [username, password]
    );

    if (anggota.length > 0) {
      const member = anggota[0];
      res.json({
        message: 'Login berhasil (Pengguna)',
        user: {
          id: member.kode,
          username: member.nama,
          role: 'pengguna',
          anggotaId: member.kode
        }
      });
      return;
    }

    // Jika tidak ditemukan di kedua tabel
    res.status(401).json({ error: 'Username atau password salah' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
