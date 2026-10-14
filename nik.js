// GET /api/nik?q=3201xxxxxxxxxxxx
// Parsing struktur NIK (16 digit) saja. Tidak mencari/mengambil data orangnya.
const PROVINSI = {
  11: "Aceh", 12: "Sumatera Utara", 13: "Sumatera Barat", 14: "Riau", 15: "Jambi",
  16: "Sumatera Selatan", 17: "Bengkulu", 18: "Lampung", 19: "Kepulauan Bangka Belitung",
  21: "Kepulauan Riau", 31: "DKI Jakarta", 32: "Jawa Barat", 33: "Jawa Tengah",
  34: "DI Yogyakarta", 35: "Jawa Timur", 36: "Banten", 51: "Bali",
  52: "Nusa Tenggara Barat", 53: "Nusa Tenggara Timur", 61: "Kalimantan Barat",
  62: "Kalimantan Tengah", 63: "Kalimantan Selatan", 64: "Kalimantan Timur",
  65: "Kalimantan Utara", 71: "Sulawesi Utara", 72: "Sulawesi Tengah",
  73: "Sulawesi Selatan", 74: "Sulawesi Tenggara", 75: "Gorontalo", 76: "Sulawesi Barat",
  81: "Maluku", 82: "Maluku Utara", 91: "Papua Barat", 92: "Papua Barat Daya",
  93: "Papua Selatan", 94: "Papua", 95: "Papua Tengah", 96: "Papua Pegunungan",
};

module.exports = (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  const q = String(req.query.q || "").trim();
  if (!/^\d{16}$/.test(q)) {
    return res.status(400).json({ status: false, message: "NIK harus 16 digit angka" });
  }

  const kodeProv = parseInt(q.slice(0, 2), 10);
  let hari = parseInt(q.slice(6, 8), 10);
  const bulan = parseInt(q.slice(8, 10), 10);
  const yy = parseInt(q.slice(10, 12), 10);

  const perempuan = hari > 40;
  if (perempuan) hari -= 40;

  const yyNow = new Date().getFullYear() % 100;
  const tahun = yy <= yyNow ? 2000 + yy : 1900 + yy; // tebakan abad, bisa ambigu

  const tgl = new Date(Date.UTC(tahun, bulan - 1, hari));
  const tglValid =
    tgl.getUTCFullYear() === tahun && tgl.getUTCMonth() === bulan - 1 && tgl.getUTCDate() === hari;

  res.status(200).json({
    status: true,
    valid_struktur: Boolean(PROVINSI[kodeProv]) && tglValid,
    kode: {
      provinsi: q.slice(0, 2),
      kabupaten_kota: q.slice(2, 4),
      kecamatan: q.slice(4, 6),
      urutan: q.slice(12, 16),
    },
    provinsi: PROVINSI[kodeProv] || null,
    jenis_kelamin: perempuan ? "Perempuan" : "Laki-laki",
    tanggal_lahir: tglValid
      ? `${String(hari).padStart(2, "0")}-${String(bulan).padStart(2, "0")}-${tahun}`
      : null,
    catatan: "Hanya validasi struktur. Tidak menjamin NIK terdaftar atau milik orang tertentu.",
  });
};
