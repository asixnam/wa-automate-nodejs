const { create } = require('@open-wa/wa-automate');
const express = require('express');
const app = express();
app.use(express.json());

let clientGlobal = null;

// Inisialisasi Venom dengan konfigurasi yang lebih stabil
create({
  headless: false, // Tampilkan browser untuk debug
  useChrome: true,
  qrTimeout: 0, // Tidak timeout QR
  authTimeout: 60, // Timeout autentikasi
  autoRefresh: true,
  killProcessOnBrowserClose: true,
  logConsole: true,
  popup: false,
  disableSpins: true
}).then(client => {
  clientGlobal = client;
  console.log('✅ Venom WA Client siap!');

  // Kirim pesan tes ke admin baru setelah berhasil login
  const adminBaru = '62@c.us'; // ← GANTI dengan nomor admin baru
  const pesanTes = 'Halo admin baru! Ini pesan tes dari Venom.';

  clientGlobal.sendText(adminBaru, pesanTes)
    .then(() => console.log('✅ Pesan tes terkirim ke admin!'))
    .catch((err) => console.error('❌ Gagal kirim:', err));
}).catch((err) => {
  console.error('❌ Gagal inisialisasi Venom:', err);
});

// Endpoint API kirim WhatsApp
app.post('/kirim-wa', async (req, res) => {
  const { nomor, pesan } = req.body;

  if (!clientGlobal) {
    return res.status(503).json({ status: 'gagal', message: 'Client belum siap atau belum login' });
  }

  if (!nomor || !pesan) {
    return res.status(400).json({ status: 'gagal', message: 'Nomor dan pesan wajib diisi' });
  }

  try {
    const nomorFix = nomor.endsWith('@c.us') ? nomor : `${nomor}@c.us`;
    await clientGlobal.sendText(nomorFix, pesan);
    return res.json({ status: 'sukses', message: 'Pesan terkirim ke ' + nomor });
  } catch (error) {
    console.error('❌ Gagal kirim pesan:', error);
    return res.status(500).json({ status: 'gagal', message: error.toString() });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 API berjalan di http://localhost:${PORT}`);
});
