# Cakrawala - Sistem Informasi Perpustakaan

**Cakrawala** adalah aplikasi Sistem Informasi Perpustakaan berbasis Web Modern yang dikembangkan menggunakan **React (Vite)** di sisi Frontend dan **Node.js (Express)** di sisi Backend. Aplikasi ini dibangun secara khusus untuk memenuhi spesifikasi dan kualifikasi Ujian Sertifikasi Kompetensi **BNSP Junior Programmer**.

Mendukung fitur algoritma _Linear Search_ (Pencarian Katalog) dan _Timsort / Sorting O(n log n)_ (Laporan Peminjaman) yang dieksekusi di sisi *Frontend* untuk optimasi, serta terintegrasi dengan arsitektur _Trigger Database MySQL_ untuk penghitungan denda dan sinkronisasi stok secara _real-time_.

---

## 🛠 Kebutuhan Sistem

Pastikan sistem Anda telah menginstal perangkat lunak berikut sebelum menjalankan aplikasi:
1. **Node.js** (Versi 18 atau 20+ disarankan)
2. **MySQL Database** (Bisa menggunakan Laragon, XAMPP, atau MySQL Server standalone)
3. **Browser Modern** (Chrome, Firefox, Edge, Safari)

---

## 🚀 Langkah Instalasi & Konfigurasi

### 1. Import Database (MySQL)
Sistem ini sangat bergantung pada struktur Database yang menyertakan _Relasi (Foreign Keys)_ dan _Trigger_ (untuk stok dan denda). 
1. Buka DBMS Anda (misalnya HeidiSQL, phpMyAdmin, atau MySQL CLI).
2. Buat database baru bernama `db_perpustakaan`.
3. Import file **`sql_seeder`** yang ada di dalam root folder proyek ini ke dalam database `db_perpustakaan` tersebut. File ini sudah berisi skema tabel, relasi, trigger, dan _dummy data_ lengkap.

### 2. Penyesuaian Konfigurasi (Opsional)
Secara bawaan (*default*), aplikasi mencoba terhubung ke database dengan kredensial berikut:
- **Host**: `localhost`
- **User**: `root`
- **Password**: ` ` (kosong)
- **Database**: `db_perpustakaan`

Jika kredensial MySQL Anda berbeda (misalnya menggunakan password), silakan sesuaikan pengaturannya di file:
👉 `src/config/db.ts`

### 3. Instalasi Dependensi (Package)
Buka terminal/CMD, arahkan ke folder proyek ini (CakrawalaBnsp), lalu jalankan perintah berikut untuk menginstal semua library yang dibutuhkan:
```bash
npm install
```

---

## 💻 Cara Menjalankan Aplikasi

Aplikasi ini menggunakan _Concurrently_ untuk menjalankan Server Backend (Port 5000) dan Server Frontend (Port 3000) secara bersamaan hanya dengan satu perintah.

Di terminal root proyek, jalankan:
```bash
npm run dev
```

Setelah berhasil, silakan buka browser Anda di alamat:
👉 **http://localhost:3000**

---

## 🔑 Kredensial Akun Demo

Anda dapat menggunakan akun-akun berikut untuk masuk dan mencoba sistem:

| Role / Akses | Username | Password | Keterangan |
| :--- | :--- | :--- | :--- |
| **Petugas / Admin** | `Ammar` | `pass123` | Hak akses penuh: Manajemen Buku, Kelola Anggota, Laporan. |
| **Pengguna / Member**| `pengguna1` | `pass123` | Hak akses terbatas: Katalog Buku, Pinjam Buku, Riwayat & Denda. |

---

## 📂 Struktur Folder Proyek

```text
CakrawalaBnsp/
├── src/
│   ├── config/          # Konfigurasi Database (db.ts)
│   ├── controllers/     # Logika Backend API (Buku, Anggota, Auth, Peminjaman)
│   ├── layouts/         # Komponen Layout (DashboardLayout UI & Navigasi)
│   ├── pages/           # Halaman Aplikasi
│   │   ├── pengguna/    # Halaman Dashboard Pengguna (Member)
│   │   ├── petugas/     # Halaman Dashboard Petugas (Admin)
│   │   └── Login.tsx    # Halaman Autentikasi / Login
│   ├── routes/          # Definisi Rute API Express (api.ts)
│   ├── utils/           # Fungsi Utilitas Algoritma (algorithms.ts -> Linear Search & Sorting)
│   ├── App.tsx          # Sistem Routing React & ProtectedRoute
│   ├── main.tsx         # React DOM Entry Point
│   └── server.ts        # Node.js / Express Server Entry Point
├── package.json         # Konfigurasi Dependensi & Script NPM
├── sql_seeder           # File Database (Tabel, Data, Relasi & Trigger)
└── tailwind.config.js   # Konfigurasi Styling (Tailwind V4 CSS)
```

---

## ✨ Daftar Fitur Utama

### 🧑‍💻 Fitur Petugas
- **Manajemen Buku (CRUD)**: Menambah, mengubah, mencari, dan menghapus buku dari sistem.
- **Kelola Anggota**: Melihat daftar anggota dan hak akses untuk menghapus (*Banned*) anggota bermasalah.
- **Persetujuan Pengembalian**: Memproses pengembalian buku (Otomatis menghitung denda jika terlambat & mengembalikan kuota stok buku berkat Trigger MySQL).
- **Laporan & Analitik**: Dasbor laporan peminjaman aktif yang diurutkan secara Descending berdasarkan tenggat waktu (Menggunakan **Timsort** di FE).

### 👥 Fitur Pengguna (Anggota)
- **Katalog Buku & Live Search**: Mengeksplorasi buku yang tersedia. Pencarian ditenagai oleh fungsi **Linear Search O(n)** untuk pemfilteran instan di memori.
- **Pinjam Buku**: Meminjam buku dengan syarat dan ketentuan waktu (default 3 hari). Jika stok habis, sistem otomatis menolak peminjaman.
- **Riwayat & Denda Real-time**: Memantau buku yang sedang dipinjam beserta riwayat masa lalu. Sistem akan menampilkan peringatan dan estimasi denda harian (Rp 1.000/hari) secara mandiri jika melewati tenggat waktu pengembalian.
