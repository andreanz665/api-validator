// GET /api/nomor?q=0812xxxxxxx
// Validasi format nomor HP Indonesia + deteksi operator dari prefix.
const PREFIX = {
  Telkomsel: ["811", "812", "813", "821", "822", "823", "851", "852", "853"],
  Indosat: ["814", "815", "816", "855", "856", "857", "858"],
  XL: ["817", "818", "819", "859", "877", "878"],
  Axis: ["831", "832", "833", "838"],
  Tri: ["895", "896", "897", "898", "899"],
  Smartfren: ["881", "882", "883", "884", "885", "886", "887", "888", "889"],
};

function normalisasi(input) {
  let d = String(input || "").replace(/\D/g, "");
  if (d.startsWith("62")) d = d.slice(2);
  else if (d.startsWith("0")) d = d.slice(1);
  return d; // bentuk nasional tanpa 0/62, contoh: 81234567890
}

module.exports = (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  const q = req.query.q;
  if (!q) return res.status(400).json({ status: false, message: "Parameter q wajib diisi" });

  const n = normalisasi(q);
  const valid = /^8\d{8,11}$/.test(n); // 9-12 digit setelah 62, diawali 8
  const prefix = n.slice(0, 3);
  const operator = Object.keys(PREFIX).find((k) => PREFIX[k].includes(prefix)) || null;

  res.status(200).json({
    status: true,
    input: q,
    valid: valid && operator !== null,
    format: {
      lokal: "0" + n,
      internasional: "+62" + n,
      tanpa_plus: "62" + n,
    },
    operator,
    catatan: "Operator berdasarkan prefix; bisa berbeda jika nomor sudah pindah operator (MNP).",
  });
};
