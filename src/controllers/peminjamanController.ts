import type { Request, Response } from 'express';
import db from '../config/db';

export const getPeminjaman = async (_req: Request, res: Response): Promise<void> => {
  try {
    const query = `
      SELECT p.*, b.judul, a.nama_lengkap 
      FROM peminjaman p
      JOIN buku b ON p.buku_id = b.id
      JOIN anggota a ON p.anggota_id = a.id
    `;
    const [rows] = await db.query(query);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getPeminjamanByAnggota = async (req: Request, res: Response): Promise<void> => {
  try {
    const { anggotaId } = req.params;
    const query = `
      SELECT p.*, b.judul 
      FROM peminjaman p
      JOIN buku b ON p.buku_id = b.id
      WHERE p.anggota_id = ?
    `;
    const [rows] = await db.query(query, [anggotaId]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const pinjamBuku = async (req: Request, res: Response): Promise<void> => {
  try {
    const { anggota_id, buku_id } = req.body;
    if (!anggota_id || !buku_id) {
      res.status(400).json({ error: 'anggota_id dan buku_id wajib diisi' });
      return;
    }

    const [bukuRows]: any = await db.query('SELECT stok FROM buku WHERE id = ?', [buku_id]);
    if (bukuRows.length === 0 || bukuRows[0].stok <= 0) {
      res.status(400).json({ error: 'Stok buku habis atau buku tidak ditemukan' });
      return;
    }

    const tglPinjam = new Date();
    const tglTenggat = new Date();
    tglTenggat.setDate(tglPinjam.getDate() + 3); 

    const tglPinjamStr = tglPinjam.toISOString().split('T')[0];
    const tglTenggatStr = tglTenggat.toISOString().split('T')[0];

    await db.query(
      'INSERT INTO peminjaman (anggota_id, buku_id, tanggal_pinjam, tanggal_tenggat) VALUES (?, ?, ?, ?)',
      [anggota_id, buku_id, tglPinjamStr, tglTenggatStr]
    );
    res.status(201).json({ message: 'Buku berhasil dipinjam' });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const kembalikanBuku = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const tglKembali = new Date().toISOString().split('T')[0];

    await db.query(
      'UPDATE peminjaman SET status = ?, tanggal_dikembalikan = ? WHERE id = ?',
      ['dikembalikan', tglKembali, id]
    );
    res.json({ message: 'Buku berhasil dikembalikan' });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
