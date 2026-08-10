import { Router } from 'express';
import { login } from '../controllers/authController';
import { getBuku, tambahBuku, hapusBuku } from '../controllers/bukuController';
import { getPeminjaman, getPeminjamanByAnggota, pinjamBuku, kembalikanBuku } from '../controllers/peminjamanController';
import { getAnggota, hapusAnggota } from '../controllers/anggotaController';

const router = Router();

// Auth
router.post('/auth/login', login);

// Buku
router.get('/buku', getBuku);
router.post('/buku', tambahBuku);
router.delete('/buku/:id', hapusBuku);

// Peminjaman
router.get('/peminjaman', getPeminjaman);
router.get('/peminjaman/anggota/:anggotaId', getPeminjamanByAnggota);
router.post('/peminjaman', pinjamBuku);
router.put('/peminjaman/:id/kembali', kembalikanBuku);

// Anggota
router.get('/anggota', getAnggota);
router.delete('/anggota/:id', hapusAnggota);

export default router;
