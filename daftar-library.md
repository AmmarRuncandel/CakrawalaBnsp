# Daftar Pustaka (Libraries) & Dependensi
**Sistem Informasi Perpustakaan (PerpusCakra)**

Dokumen ini memuat daftar semua *library* (pustaka) utama yang digunakan dalam pengembangan sistem perpustakaan PerpusCakra, beserta versi, lisensi, dan sumber resminya. Aplikasi ini dikembangkan menggunakan tumpukan teknologi modern untuk memastikan performa yang cepat dan pengalaman pengguna yang halus.

---

## 1. Dependensi Utama (Production Dependencies)

| Nama Library | Versi | Sumber (Dokumentasi / NPM) | Lisensi | Deskripsi Fungsional |
| :--- | :--- | :--- | :--- | :--- |
| **React** | `^19.2.8` | [react.dev](https://react.dev/) | MIT | *Library* antarmuka (*frontend*) utama yang digunakan untuk membangun komponen visual. |
| **React DOM** | `^19.2.8` | [npmjs.com/package/react-dom](https://www.npmjs.com/package/react-dom) | MIT | Penghubung antara React dan DOM browser untuk *rendering*. |
| **React Router DOM** | `^7.18.2` | [reactrouter.com](https://reactrouter.com/) | MIT | Mengatur navigasi dan rute (*routing*) aplikasi tanpa memuat ulang halaman (*Single Page App*). |
| **Express** | `^5.2.1` | [expressjs.com](https://expressjs.com/) | MIT | *Framework* *backend* Node.js untuk membuat *REST API* yang cepat dan minimalis. |
| **MySQL2** | `^3.23.2` | [npmjs.com/package/mysql2](https://www.npmjs.com/package/mysql2) | MIT | Klien MySQL untuk Node.js, sangat cepat, dengan dukungan asinkronus (`Promise`) dan *Prepared Statements*. |
| **Cors** | `^2.8.6` | [npmjs.com/package/cors](https://www.npmjs.com/package/cors) | MIT | *Middleware* Express untuk mengizinkan permintaan lintas sumber (*Cross-Origin Resource Sharing*) dari Vite (Port 3000) ke Express (Port 5000). |
| **Framer Motion** | `^13.0.0` | [framer.com/motion](https://www.framer.com/motion/) | MIT | *Library* animasi tingkat lanjut untuk transisi antar halaman dan mikro-interaksi (*hover/tap*) di *frontend*. |
| **React Icons** | `^5.7.0` | [react-icons.github.io](https://react-icons.github.io/react-icons/) | MIT | Menyediakan ribuan set ikon SVG ringan. Sistem ini memakai paket `Feather Icons` (`Fi`). |
| **SweetAlert2** | `^11.26.25` | [sweetalert2.github.io](https://sweetalert2.github.io/) | MIT | Modifikasi kotak dialog (*alert/popup*) bawaan *browser* agar lebih cantik, responsif, dan dinamis. |

---

## 2. Dependensi Pengembangan (Development Dependencies)

Berikut adalah *tooling* yang hanya digunakan pada saat tahap pengembangan (*development*) atau saat proses *build*.

| Nama Library | Versi | Sumber / NPM | Lisensi | Deskripsi Fungsional |
| :--- | :--- | :--- | :--- | :--- |
| **Vite** | `^8.2.0` | [vitejs.dev](https://vitejs.dev/) | MIT | *Build tool* dan peladen pengembangan (*dev server*) *frontend* yang super cepat berbasis ES modules. |
| **Tailwind CSS** | `^4.3.3` | [tailwindcss.com](https://tailwindcss.com/) | MIT | *Framework CSS utility-first* untuk *styling* antarmuka tanpa menulis CSS eksternal secara manual. |
| **TypeScript** | `~6.0.2` | [typescriptlang.org](https://www.typescriptlang.org/) | Apache-2.0 | Supersup bahasa dari JavaScript yang menambahkan perlindungan *Static Typing*. |
| **TSX** | `^4.23.12` | [npmjs.com/package/tsx](https://www.npmjs.com/package/tsx) | MIT | Penjalanan kode TypeScript Node.js (*backend*) secara instan tanpa perlu kompilasi terpisah. |
| **Concurrently** | `^9.0.0` | [npmjs.com/package/concurrently](https://www.npmjs.com/package/concurrently) | MIT | Memungkinkan *server Frontend* (Vite) dan *Backend* (Node) dijalankan dengan satu perintah terminal secara paralel. |
| **ESLint** | `^10.8.0` | [eslint.org](https://eslint.org/) | MIT | Menganalisis dan menemukan masalah pada kode statis berdasarkan standar penulisan ECMA yang direkomendasikan. |

---

## 3. Catatan Hak Cipta dan Lisensi
Secara keseluruhan, proyek ini bergantung kuat pada ekosistem *open-source* berlisensi **MIT** dan **Apache 2.0**. Lisensi ini mengizinkan modifikasi, distribusi, komersialisasi, serta penggunaan pribadi secara bebas dan terbuka tanpa kewajiban menutup kode sumber (*proprietary*). 

Penggunaan seluruh pustaka di atas telah dipertimbangkan berdasarkan standar performa, keandalan komunitas, dan keamanan dalam lingkup Ujian Sertifikasi (BNSP).
