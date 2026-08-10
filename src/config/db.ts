/**
 * ============================================================
 * File        : db.ts
 * Deskripsi   : Konfigurasi koneksi database MySQL menggunakan
 *               mysql2/promise dengan Connection Pool, sehingga
 *               koneksi dapat digunakan ulang secara efisien
 *               tanpa harus membuka/menutup koneksi setiap request.
 * Fungsi      : (Tidak ada fungsi, hanya ekspor instance pool database)
 * Pembuat      : Muhammad Ammar Luthfi Azzufar
 * Tanggal Dibuat : 10-08-2026
 * Versi        : 1.0.0
 * ============================================================
 */

import mysql from 'mysql2/promise';

// Connection Pool dipilih daripada createConnection biasa karena:
// Pool mengelola sejumlah koneksi yang sudah terbuka (reuse),
// sehingga tidak ada overhead membuka koneksi TCP baru di setiap request.
// connectionLimit: 10 → maksimal 10 query bisa berjalan paralel,
// sisanya akan antri (queueLimit: 0 = antrian tak terbatas).
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'db_perpustakaan',
  waitForConnections: true, // Jika pool penuh, tunggu koneksi bebas (tidak langsung error)
  connectionLimit: 10,
  queueLimit: 0            // 0 = tidak ada batas antrian
});

export default db;
