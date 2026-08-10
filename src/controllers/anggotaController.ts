import type { Request, Response } from 'express';
import db from '../config/db';

export const getAnggota = async (_req: Request, res: Response): Promise<void> => {
  try {
    const query = `
      SELECT a.*, u.username, u.role
      FROM anggota a
      JOIN users u ON a.user_id = u.id
    `;
    const [rows] = await db.query(query);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const hapusAnggota = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const [anggotaRows]: any = await db.query('SELECT user_id FROM anggota WHERE id = ?', [id]);
    if (anggotaRows.length > 0) {
      await db.query('DELETE FROM users WHERE id = ?', [anggotaRows[0].user_id]);
    }
    res.json({ message: 'Anggota berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
