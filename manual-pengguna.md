# Manual Penggunaan Aplikasi PerpusCakra
*(Khusus untuk Petugas / Administrator)*

Dokumen ini berisi panduan teknis langkah demi langkah mengenai cara menggunakan aplikasi PerpusCakra sebagai **Admin (Petugas Perpustakaan)**.

---

## 1. Masuk ke Sistem (Login)
Untuk dapat mengakses panel admin, Anda harus melakukan *login* dengan kredensial yang valid.
- **Buka halaman awal** aplikasi di `http://localhost:3000/`.
- Masukkan **Username**: `admin`
- Masukkan **Password**: `admin123`
- Klik tombol **Masuk ke Dashboard**. Sistem akan secara otomatis mendeteksi bahwa Anda adalah seorang Admin dan mengarahkan Anda ke *Dashboard Petugas*.

---

## 2. Navigasi Dashboard
Setelah berhasil masuk, Anda akan diarahkan ke antarmuka utama admin. Pada layar desktop, menu berada di sebelah **kiri**. Pada perangkat seluler (HP), Anda dapat menekan ikon **Menu (Garis Tiga)** di pojok kiri atas untuk memunculkan panel menu navigasi.

Menu yang tersedia meliputi:
1. **Manajemen Buku**
2. **Data Anggota**
3. **Pengembalian**
4. **Laporan**

---

## 3. Manajemen Buku (Katalog)
Tab ini digunakan untuk mengelola seluruh stok dan data buku yang tersedia di perpustakaan.

- **Melihat Buku:** Daftar buku beserta stok, judul, dan pengarang tersedia di tabel utama.
- **Pencarian Cepat:** Gunakan kolom pencarian di bagian atas tabel untuk mencari buku secara spesifik (berdasarkan Judul atau Pengarang).
- **Menambahkan Buku Baru:**
  1. Klik tombol **+ Tambah Buku**.
  2. Isi formulir dengan lengkap (Kode Buku, Judul, Pengarang, Penerbit, Tahun Terbit, Kategori, dan Stok). Kode Buku **wajib unik** (misal: `BK015`).
  3. Klik **Simpan**.
- **Menghapus Buku:**
  1. Klik ikon **Tempat Sampah (Hapus)** berwarna merah di baris buku yang ingin Anda hilangkan.
  2. Konfirmasi penghapusan pada *pop-up* peringatan yang muncul. Buku akan dihapus dari sistem secara permanen.

---

## 4. Data Anggota
Tab ini memuat daftar anggota perpustakaan yang terdaftar di dalam sistem.

- **Melihat Daftar Anggota:** Anda dapat memantau nama, kode keanggotaan, email, dan nomor telepon seluruh anggota aktif.
- **Banned / Penghapusan Akun Anggota:**
  1. Temukan anggota yang melakukan pelanggaran berat pada tabel.
  2. Klik tombol **Banned** berwarna merah di sisi kanan.
  3. Tekan **Ya, Banned!** untuk mengonfirmasi.
  > **⚠️ PERHATIAN:** Fitur ini menghapus data anggota secara permanen. Karena database menerapkan sistem *CASCADE*, semua riwayat peminjaman yang bersangkutan juga akan **ikut terhapus**.

---

## 5. Proses Pengembalian
Fitur krusial bagi petugas untuk mencatat pengembalian fisik buku dari anggota dan menghitung otomatis denda keterlambatan jika ada.

- **Melihat Peminjaman Aktif:** Tabel secara otomatis hanya menampilkan peminjaman yang *belum dikembalikan*.
- **Peringatan Tenggat:** 
  - Ikon jam berwarna hijau: Peminjaman berjalan wajar (belum jatuh tempo).
  - Ikon segitiga merah: Peminjaman **Telah Jatuh Tempo / Terlambat**.
- **Konfirmasi Pengembalian & Denda:**
  1. Klik tombol **✔ Proses** di samping nama peminjam yang mengembalikan buku.
  2. Sistem akan menampilkan rincian buku dan identitas peminjam.
  3. Apabila terlambat, sistem secara otomatis akan memunculkan nominal **Denda Keterlambatan** (berdasarkan selisih hari dari tenggat waktu).
  4. Klik **Konfirmasi Kembali**. Status akan otomatis berpindah menjadi "Kembali" dan stok buku di sistem akan bertambah kembali.

---

## 6. Laporan (Analitik Peminjaman)
Tab ini sangat berguna untuk memantau aktivitas sirkulasi buku perpustakaan.

- **Statistik Cepat:** Menampilkan rangkuman total buku, anggota aktif, dan buku yang sedang berada di luar (sedang dipinjam).
- **Daftar Peminjaman Aktif:** Diurutkan secara prioritas; menampilkan transaksi dengan tenggat waktu paling dekat di urutan paling atas.
- **Histori Keterlambatan:** Memantau siapa saja yang pernah terlambat mengembalikan buku secara historis, lengkap beserta nominal denda yang pernah mereka bayarkan. 

---

## 7. Keluar (Logout)
- Klik tombol **Keluar** dengan ikon panah di bagian paling bawah panel menu sebelah kiri.
- Sesi Anda akan berakhir dengan aman, dan halaman kembali ke menu utama form Login. 
