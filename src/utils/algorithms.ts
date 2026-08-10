/**
 * 1. Fungsi cariBuku(keyword)
 * Digunakan untuk mencari buku berdasarkan judul atau penulis.
 * 
 * ALASAN PEMILIHAN STRUKTUR DATA:
 * Menggunakan Array of Objects. Objek merepresentasikan satu entitas (buku),
 * dan array digunakan untuk menyimpan kumpulan (katalog) buku.
 * Pemrosesan di sisi aplikasi mengurangi query LIKE ke database yang berat jika
 * dilakukan berulang kali pada fitur live search.
 * 
 * ALGORITMA & KOMPLEKSITAS WAKTU:
 * Menggunakan "Linear Search" dengan method filter().
 * Algoritma ini menelusuri array satu per satu (O(n)) dan pada setiap elemen
 * melakukan pencarian string (O(m)), sehingga total kompleksitas waktu terburuk
 * adalah O(n * m), di mana n = jumlah buku, dan m = panjang keyword.
 * Secara umum disebut O(n) jika panjang string dianggap konstan.
 */
export function cariBuku<T extends { judul: string; penulis: string }>(
  dataBuku: T[],
  keyword: string
): T[] {
  if (!keyword) return dataBuku;
  const lowerKeyword = keyword.toLowerCase();
  
  return dataBuku.filter(
    (buku) =>
      buku.judul.toLowerCase().includes(lowerKeyword) ||
      buku.penulis.toLowerCase().includes(lowerKeyword)
  );
}

/**
 * 2. Fungsi urutkanPeminjaman(dataPeminjaman)
 * Mengurutkan daftar peminjaman berdasarkan tanggal_tenggat secara ascending (dari yang paling dekat/lewat).
 * 
 * ALGORITMA & KOMPLEKSITAS WAKTU:
 * Menggunakan Array.prototype.sort().
 * Implementasi sort pada engine JavaScript modern (seperti V8 di Node/Chrome)
 * menggunakan algoritma Timsort (kombinasi Merge Sort dan Insertion Sort).
 * Kompleksitas Waktu:
 * - Best Case: O(n) jika data sudah terurut.
 * - Average & Worst Case: O(n log n).
 */
export function urutkanPeminjaman<T extends { tanggal_tenggat: string | Date }>(
  dataPeminjaman: T[]
): T[] {
  // Buat salinan array agar tidak merusak array asli (mutasi)
  const sortedData = [...dataPeminjaman];
  
  return sortedData.sort((a, b) => {
    const timeA = new Date(a.tanggal_tenggat).getTime();
    const timeB = new Date(b.tanggal_tenggat).getTime();
    return timeA - timeB; // Ascending (tenggat paling dekat di awal)
  });
}
