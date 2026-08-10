# Guidelines Penulisan Kode (Coding Guidelines)
**Sistem Informasi Perpustakaan (PerpusCakra)**

Dokumen ini berisi standar dan konvensi penulisan kode yang harus dipatuhi oleh seluruh pengembang di dalam proyek ini. Tujuannya adalah untuk menjaga konsistensi, keterbacaan, dan kualitas *codebase*, terutama dalam ruang lingkup ujian praktik BNSP Junior Programmer.

---

## 1. Standar Header Dokumen (File Header)
Setiap file kode utama (seperti *controller*, *router*, halaman UI, komponen, dan *utils*) wajib memiliki blok komentar standar di awal (paling atas) file. Hal ini memudahkan *auditor* atau *developer* lain memahami tujuan file tanpa harus membaca seluruh logika.

**Format Standar:**
```typescript
/**
 * ============================================================
 * File        : NamaFile.ts / NamaFile.tsx
 * Deskripsi   : Penjelasan singkat mengenai peran dan logika di file ini.
 * Fungsi      :
 *   - namaFungsi : Penjelasan fungsi 1
 *   - NamaKomponen : Penjelasan fungsi 2
 * Pembuat      : Nama Anda
 * Tanggal Dibuat : DD-MM-YYYY
 * Versi        : X.X.X
 * ============================================================
 */
```

---

## 2. Arsitektur Frontend (React + TypeScript + Vite)

- **Komponen Fungsional:** Selalu gunakan *Functional Components* (Arrow Function atau Named Function) dan *React Hooks* (useState, useEffect, useCallback, dsb). Jangan menggunakan *Class Components*.
- **Penamaan Komponen:** Gunakan format **PascalCase** untuk nama file `.tsx` dan nama fungsi komponennya (contoh: `DashboardAdmin.tsx`, `DashboardLayout.tsx`).
- **Styling UI:**
  - Gunakan sepenuhnya *Tailwind CSS* untuk penataan gaya (*styling*).
  - Sebisa mungkin hindari penulisan *inline CSS* statis (kecuali untuk nilai dinamis yang ditarik dari *state*).
  - Pisahkan pewarnaan desain menggunakan token warna *Tailwind* di `tailwind.config.js` (seperti `primary`, `primary-dark`, dsb) untuk konsistensi tema UI (Hijau *Teal* & Gelap).
- **Animasi:** Gunakan pustaka `framer-motion` (`<motion.div>`) untuk menyuntikkan interaktivitas modern (misalnya, animasi transisi antar-tab atau efek *hover/tap* pada tombol).
- **Tipe Data (TypeScript):** Selalu terapkan antarmuka (Interface) untuk setiap Array of Objects atau properti (*Props*) yang dikonsumsi React.
  ```typescript
  interface Buku {
    kode: string;
    judul: string;
    pengarang: string;
    penerbit: string;
    tahun: number;
    kategori: string;
    stok: number;
  }
  ```

---

## 3. Arsitektur Backend (Express + TypeScript + MySQL2)

- **Pola Desain MVC (Model-View-Controller):**
  - Meskipun tidak ada ORM (Model) eksplisit, pisahkan seluruh logika kueri database (SQL) ke dalam **Controllers**.
  - **Routes** bertugas secara murni mendaftarkan rute (endpoint URL) HTTP ke fungsi Controller yang sesuai.
- **Kueri Database:**
  - Gunakan **Raw SQL** (SQL murni tanpa ORM) karena ini merupakan syarat dari kurikulum ujian.
  - Untuk memproteksi aplikasi dari SQL Injection, **selalu** gunakan *Prepared Statements / Parameterized Queries* (`?`) di modul `mysql2/promise`.
  ```typescript
  // BENAR & AMAN
  const [rows] = await db.query('SELECT * FROM buku WHERE kode = ?', [kode]);
  
  // DILARANG (Rentan SQL Injection)
  // const [rows] = await db.query(`SELECT * FROM buku WHERE kode = '${kode}'`);
  ```
- **Penanganan Kesalahan (Error Handling):** Selalu bungkus logika asinkronus dengan blok `try...catch` dan pastikan server selalu membalas respons berstatus (misal HTTP 500) daripada membiarkan proses Node.js mengalami *crash*.

---

## 4. Konvensi Penamaan (Naming Conventions)

- **Fungsi dan Variabel:** Gunakan *camelCase* (`hitungDenda`, `fetchData`, `isModalOpen`).
- **Antarmuka (Interface) & Tipe (Type):** Gunakan *PascalCase* (`Buku`, `Anggota`, `PeminjamanProps`).
- **Variabel Konstan (Constants):** Gunakan huruf kapital penuh dengan *underscore* (`COVER_COLORS`, `MAX_PINJAM`).
- **Penamaan Rute API:** RESTful standar, selalu menggunakan huruf kecil dan jamak (*plural*).
  - `GET /api/buku`
  - `POST /api/anggota`
  - `PUT /api/peminjaman/:id/kembali`

---

## 5. Implementasi Algoritma
Sesuai tuntutan kompetensi Junior Programmer, operasi *sorting* dan *searching* ditekankan untuk diproses pada *Frontend* (Memori) alih-alih mengandalkan manipulasi kueri SQL (`ORDER BY` atau `LIKE`).
- Gunakan dan import fungsi algoritma yang telah disusun dan didokumentasikan dengan rapi di dalam `src/utils/algorithms.ts`.
- Fungsi `.filter()` untuk pencarian linear (Linear Search) dengan *Time Complexity* O(n).
- Fungsi `.sort()` untuk pengurutan Timsort dengan *Time Complexity* rata-rata O(n log n).

---

## 6. Linter dan Keamanan
- Pastikan kode bersih dan melewati pengujian linter. Jangan biarkan ada variabel yang dideklarasikan tetapi tidak pernah dipakai (*no-unused-vars*).
- Patuhi pedoman dependensi React: jangan menaruh pemanggilan *fetch API* (seperti `useEffect`) yang memicu pembaharuan antarmuka secara tidak terkendali (*infinite re-rendering loop*). Gunakan `useCallback` jika fungsi *fetch* dijadikan dependensi *hook*.
