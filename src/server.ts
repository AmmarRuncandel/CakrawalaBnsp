/**
 * ============================================================
 * File        : server.ts
 * Deskripsi   : Entry point backend Express.js. Mendaftarkan
 *               semua middleware global (CORS, JSON parser) dan
 *               me-mount semua route API pada prefix "/api".
 * Fungsi      : (Tidak ada deklarasi fungsi, hanya inisialisasi server)
 * Pembuat      : Muhammad Ammar Luthfi Azzufar
 * Tanggal Dibuat : 10-08-2026
 * Versi        : 1.0.0
 * ============================================================
 */

import express from 'express';
import cors from 'cors';
import apiRoutes from './routes/api';

const app = express();
const PORT = 5000;

// cors() dipasang secara global agar setiap response memiliki header
// "Access-Control-Allow-Origin: *", mencegah browser memblokir request
// dari origin berbeda (localhost:3000 → localhost:5000).
app.use(cors());

// express.json() mem-parse body request bertipe application/json
// menjadi objek JavaScript (req.body), tanpa middleware ini req.body = undefined.
app.use(express.json());

// Semua endpoint API diprefiks "/api" agar terpisah dari root,
// memudahkan versioning di masa depan (mis: /api/v2/...).
app.use('/api', apiRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
