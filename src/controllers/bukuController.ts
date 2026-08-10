import type { Request, Response } from 'express';
import db from '../config/db';

export const getBuku = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [rows] = await db.query('SELECT * FROM buku');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const tambahBuku = async (req: Request, res: Response): Promise<void> => {
  try {
    const { judul, penulis, penerbit, tahun_terbit, stok } = req.body;
    if (!judul || !penulis || stok === undefined) {
      res.status(400).json({ error: 'Judul, penulis, dan stok wajib diisi' });
      return;
    }
    
    await db.query(
      'INSERT INTO buku (judul, penulis, penerbit, tahun_terbit, stok) VALUES (?, ?, ?, ?, ?)',
      [judul, penulis, penerbit || null, tahun_terbit || null, stok]
    );
    res.status(201).json({ message: 'Buku berhasil ditambahkan' });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const hapusBuku = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM buku WHERE id = ?', [id]);
    res.json({ message: 'Buku berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
