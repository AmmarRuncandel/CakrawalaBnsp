import type { Request, Response } from 'express';
import db from '../config/db';

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      res.status(400).json({ error: 'Username dan password wajib diisi' });
      return;
    }
    
    const [users]: any = await db.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password]);
    
    if (users.length === 0) {
      res.status(401).json({ error: 'Username atau password salah' });
      return;
    }
    
    const user = users[0];
    
    let anggotaId = null;
    if (user.role === 'pengguna') {
      const [anggota]: any = await db.query('SELECT id FROM anggota WHERE user_id = ?', [user.id]);
      if (anggota.length > 0) anggotaId = anggota[0].id;
    }

    res.json({
      message: 'Login berhasil',
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        anggotaId
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
