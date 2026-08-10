/**
 * ============================================================
 * File        : algorithms.ts
 * Deskripsi   : Implementasi algoritma wajib BNSP Junior Programmer.
 *               Berisi fungsi cariBuku (Linear Search) dan
 *               urutkanPeminjaman (Timsort via Array.sort) yang
 *               beban query ke database dan membuktikan penguasaan
 *               struktur data Array of Objects.
 * Fungsi      :
 *   - cariBuku         : Melakukan linear search pada array berdasarkan judul/penulis.
 *   - urutkanPeminjaman: Melakukan Timsort pada array berdasarkan tenggat waktu.
 * Pembuat      : Muhammad Ammar Luthfi Azzufar
 * Tanggal Dibuat : 10-08-2026
 * Versi        : 1.0.0
 * ============================================================
 */

/**
 * cariBuku — Linear Search pada Array of Objects
 *
 * MENGAPA Linear Search (bukan Binary Search)?
 * Binary Search membutuhkan data yang sudah terurut secara alfabetis
 * berdasarkan field yang dicari. Karena kita ingin mencari di DUA field
 * sekaligus (judul DAN penulis) secara bersamaan, pengurutan sebelum
 * pencarian justru menambah overhead O(n log n). Linear Search lebih
 * tepat untuk kasus multi-field search pada data berukuran kecil-menengah.
 *
 * MENGAPA dijalankan di FE, bukan query LIKE di SQL?
 * Fitur ini adalah live-search (filter setiap keystroke). Jika menggunakan
 * SQL LIKE, setiap penekanan tombol akan membuat HTTP request ke database —
 * tidak efisien dan memberikan latency yang buruk. Dengan memuat semua data
 * sekali lalu filter di memori, respons menjadi instan (O(n) di RAM vs I/O).
 *
 * STRUKTUR DATA: Array of Objects
 * - Object (T) = satu entitas buku { id, judul, penulis, ... }
 * - Array (T[]) = kumpulan/katalog buku → koleksi yang dapat di-iterate
 *
 * KOMPLEKSITAS WAKTU: O(n * m)
 * - n = jumlah buku dalam array (iterasi setiap elemen)
 * - m = panjang keyword (operasi includes() per elemen)
 * - Disebut O(n) jika m dianggap konstan (keyword pendek)
 * KOMPLEKSITAS RUANG: O(k) — k = jumlah elemen yang lolos filter
 */
export function cariBuku<T extends { judul: string; penulis: string }>(
  dataBuku: T[],
  keyword: string
): T[] {
  // Early exit: jika keyword kosong, kembalikan semua data tanpa iterasi
  if (!keyword) return dataBuku;

  // Normalisasi ke lowercase sekali di luar loop untuk efisiensi —
  // mencegah konversi string berulang di setiap iterasi filter
  const lowerKeyword = keyword.toLowerCase();

  // filter() menghasilkan array baru (tidak mutasi asli) berisi elemen
  // yang memenuhi kondisi: judul ATAU penulis mengandung keyword
  return dataBuku.filter(
    (buku) =>
      buku.judul.toLowerCase().includes(lowerKeyword) ||
      buku.penulis.toLowerCase().includes(lowerKeyword)
  );
}

/**
 * urutkanPeminjaman — Pengurutan Array of Objects (Timsort)
 *
 * MENGAPA diurutkan di FE, bukan ORDER BY di SQL?
 * Data peminjaman sudah di-fetch untuk keperluan tampilan (tidak ada request
 * tambahan). Sorting di memori FE menghindari round-trip ke database dan
 * merupakan demonstrasi eksplisit penggunaan algoritma sorting di kode aplikasi
 * (syarat wajib BNSP).
 *
 * MENGAPA Array.prototype.sort() (Timsort)?
 * Timsort adalah algoritma hybrid (Merge Sort + Insertion Sort) yang sangat
 * efisien untuk data dunia nyata yang sering sudah "hampir terurut" (partially
 * sorted). V8 engine (Node.js/Chrome) menggunakan Timsort sejak versi 7.0.
 *
 * KOMPLEKSITAS WAKTU:
 * - Best Case    : O(n)       — jika data sudah terurut (deteksi run)
 * - Average Case : O(n log n) — kasus umum
 * - Worst Case   : O(n log n) — lebih baik dari Quicksort di kasus tertentu
 * KOMPLEKSITAS RUANG: O(n) — spread operator [...] membuat salinan baru
 */
export function urutkanPeminjaman<T extends { tanggal_tenggat: string | Date }>(
  dataPeminjaman: T[]
): T[] {
  // Spread operator untuk membuat shallow copy — kita TIDAK boleh mutasi
  // array asli (prop dari state React) karena dapat menyebabkan bug rendering.
  const sortedData = [...dataPeminjaman];

  return sortedData.sort((a, b) => {
    // Konversi ke timestamp (milidetik) untuk perbandingan numerik yang presisi.
    // Perbandingan string tanggal langsung (a > b) bisa gagal untuk format non-ISO.
    const timeA = new Date(a.tanggal_tenggat).getTime();
    const timeB = new Date(b.tanggal_tenggat).getTime();

    // timeA - timeB → Ascending: deadline terdekat (nilai paling kecil) di posisi pertama.
    // Ini penting agar petugas dapat langsung melihat buku yang paling urgent di baris atas.
    return timeA - timeB;
  });
}
