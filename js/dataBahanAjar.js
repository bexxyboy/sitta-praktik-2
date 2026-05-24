// =============================================
// SITTA UT — DATA BAHAN AJAR (Dummy Data)
// Tugas Praktik 2 Vue.js
// =============================================

var dataPengguna = [
  { id: 1, nama: "Rina Wulandari",  email: "rina@ut.ac.id",  password: "rina123",  role: "UPBJJ-UT",      lokasi: "UPBJJ Jakarta" },
  { id: 2, nama: "Agus Pranoto",    email: "agus@ut.ac.id",  password: "agus123",  role: "UPBJJ-UT",      lokasi: "UPBJJ Makassar" },
  { id: 3, nama: "Siti Marlina",    email: "siti@ut.ac.id",  password: "siti123",  role: "Puslaba",        lokasi: "Pusat" },
  { id: 4, nama: "Doni Setiawan",   email: "doni@ut.ac.id",  password: "doni123",  role: "Fakultas",       lokasi: "FISIP" },
  { id: 5, nama: "Admin SITTA",     email: "admin@ut.ac.id", password: "admin123", role: "Administrator",  lokasi: "Pusat" }
];

var upbjjList = ["Jakarta", "Surabaya", "Makassar", "Padang", "Denpasar"];

var kategoriList = ["MK Wajib", "MK Pilihan", "Praktikum", "Problem-Based"];

var pengirimanList = [
  { kode: "JNE-REG", nama: "JNE Regular (3-5 hari)" },
  { kode: "JNE-EXP", nama: "JNE Express (1-2 hari)" }
];

var paketList = [
  { kode: "PAKET-UT-001", nama: "PAKET IPS Dasar",   isi: ["EKMA4116","EKMA4115"], harga: 120000 },
  { kode: "PAKET-UT-002", nama: "PAKET IPA Dasar",   isi: ["BIOL4201","FISIP4001"], harga: 140000 },
  { kode: "PAKET-UT-003", nama: "PAKET Komunikasi",  isi: ["SKOM4101","EKMA4216"], harga: 130000 }
];

var stokList = [
  {
    kode: "EKMA4116",
    judul: "Pengantar Manajemen",
    kategori: "MK Wajib",
    upbjj: "Jakarta",
    lokasiRak: "R1-A3",
    harga: 65000,
    qty: 28,
    safety: 20,
    catatanHTML: "<em>Edisi 2024, cetak ulang</em>"
  },
  {
    kode: "EKMA4115",
    judul: "Pengantar Akuntansi",
    kategori: "MK Wajib",
    upbjj: "Jakarta",
    lokasiRak: "R1-A4",
    harga: 60000,
    qty: 7,
    safety: 15,
    catatanHTML: "<strong>Cover baru</strong>"
  },
  {
    kode: "BIOL4201",
    judul: "Biologi Umum (Praktikum)",
    kategori: "Praktikum",
    upbjj: "Surabaya",
    lokasiRak: "R3-B2",
    harga: 80000,
    qty: 12,
    safety: 10,
    catatanHTML: "Butuh <u>pendingin</u> untuk kit basah"
  },
  {
    kode: "FISIP4001",
    judul: "Dasar-Dasar Sosiologi",
    kategori: "MK Pilihan",
    upbjj: "Makassar",
    lokasiRak: "R2-C1",
    harga: 55000,
    qty: 2,
    safety: 8,
    catatanHTML: "Stok <i>menipis</i>, prioritaskan reorder"
  },
  {
    kode: "EKMA4216",
    judul: "Manajemen Keuangan",
    kategori: "MK Wajib",
    upbjj: "Padang",
    lokasiRak: "R2-A1",
    harga: 75000,
    qty: 0,
    safety: 10,
    catatanHTML: "Segera lakukan <strong>reorder</strong>"
  },
  {
    kode: "SKOM4101",
    judul: "Pengantar Ilmu Komunikasi",
    kategori: "MK Pilihan",
    upbjj: "Denpasar",
    lokasiRak: "R4-C3",
    harga: 70000,
    qty: 35,
    safety: 15,
    catatanHTML: "Edisi terbaru <em>2023</em>"
  },
  {
    kode: "PAUD4306",
    judul: "Perkembangan Anak Usia Dini",
    kategori: "Problem-Based",
    upbjj: "Surabaya",
    lokasiRak: "R5-D2",
    harga: 72000,
    qty: 18,
    safety: 20,
    catatanHTML: "Modul 1-9, <u>lengkap</u>"
  },
  {
    kode: "BIOL4223",
    judul: "Mikrobiologi Dasar",
    kategori: "Praktikum",
    upbjj: "Makassar",
    lokasiRak: "R3-B5",
    harga: 85000,
    qty: 5,
    safety: 12,
    catatanHTML: "Kit lab <strong>wajib</strong> disertakan"
  }
];

var dataTracking = {
  "DO2025-001": {
    nomorDO: "DO2025-001",
    nim: "123456789",
    nama: "Rina Wulandari",
    status: "Dalam Perjalanan",
    ekspedisi: "JNE-REG",
    namaEkspedisi: "JNE Regular",
    tanggalKirim: "2025-08-25",
    paket: "PAKET-UT-001",
    namaPaket: "PAKET IPS Dasar",
    total: 120000,
    perjalanan: [
      { waktu: "2025-08-25 10:12:20", keterangan: "Penerimaan di Loket: TANGERANG SELATAN. Pengirim: Universitas Terbuka" },
      { waktu: "2025-08-25 14:07:56", keterangan: "Tiba di Hub: TANGERANG SELATAN" },
      { waktu: "2025-08-25 16:30:00", keterangan: "Diteruskan ke Kantor Jakarta Selatan" }
    ]
  },
  "DO2025-002": {
    nomorDO: "DO2025-002",
    nim: "987654321",
    nama: "Agus Pranoto",
    status: "Dikirim",
    ekspedisi: "JNE-EXP",
    namaEkspedisi: "JNE Express",
    tanggalKirim: "2025-08-25",
    paket: "PAKET-UT-002",
    namaPaket: "PAKET IPA Dasar",
    total: 140000,
    perjalanan: [
      { waktu: "2025-08-25 10:12:20", keterangan: "Penerimaan di Loket: TANGERANG SELATAN. Pengirim: Universitas Terbuka" },
      { waktu: "2025-08-25 14:07:56", keterangan: "Tiba di Hub: TANGERANG SELATAN" },
      { waktu: "2025-08-25 16:30:10", keterangan: "Diteruskan ke Kantor Kota Bandung" },
      { waktu: "2025-08-26 12:15:33", keterangan: "Tiba di Hub: Kota BANDUNG" },
      { waktu: "2025-08-26 15:06:12", keterangan: "Proses antar ke Cimahi" },
      { waktu: "2025-08-26 20:00:00", keterangan: "Selesai Antar. Penerima: Agus Pranoto" }
    ]
  }
};
