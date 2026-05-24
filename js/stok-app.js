// =============================================
// SITTA UT — STOK APP (Vue.js)
// Halaman Stok Bahan Ajar
// =============================================

var stokApp = new Vue({
  el: '#stok-app',

  data: {
    // ── Auth ─────────────────────────────────
    currentUser: null,

    // ── Master Lists ─────────────────────────
    upbjjList: upbjjList,
    kategoriList: kategoriList,
    stok: JSON.parse(JSON.stringify(stokList)), // deep copy agar data asli tidak berubah

    // ── Filter & Sort ─────────────────────────
    filterUpbjj: '',
    filterKategori: '',
    filterReorder: false,
    sortBy: '',       // 'judul' | 'qty' | 'harga'
    sortDir: 'asc',

    // ── Form Tambah Bahan Ajar ────────────────
    showFormTambah: false,
    formTambah: {
      kode: '', judul: '', kategori: '', upbjj: '',
      lokasiRak: '', harga: '', qty: '', safety: '', catatanHTML: ''
    },
    errTambah: {},
    alertTambah: '',

    // ── Modal Edit ────────────────────────────
    showModalEdit: false,
    formEdit: {},
    errEdit: {},
    alertEdit: '',

    // ── Notifikasi global ─────────────────────
    toast: { show: false, msg: '', type: 'success' },

    // ── Watcher helpers ───────────────────────
    reorderCount: 0,
    lastFilterUpbjj: '',
  },

  // ============================================
  // COMPUTED PROPERTIES
  // ============================================
  computed: {
    /**
     * Daftar kategori yang tersedia untuk UPBJJ yang dipilih.
     * Dependent options: hanya muncul setelah filterUpbjj dipilih.
     */
    filteredKategoriOptions() {
      if (!this.filterUpbjj) return [];
      const kategorisInUpbjj = this.stok
        .filter(s => s.upbjj === this.filterUpbjj)
        .map(s => s.kategori);
      return [...new Set(kategorisInUpbjj)];
    },

    /**
     * Daftar stok setelah semua filter & sort diterapkan.
     * Menggunakan computed agar tidak recompute kecuali dependensi berubah.
     */
    filteredStok() {
      let hasil = this.stok;

      // Filter UT-Daerah
      if (this.filterUpbjj) {
        hasil = hasil.filter(s => s.upbjj === this.filterUpbjj);
      }

      // Filter Kategori (dependent: hanya aktif jika filterUpbjj juga aktif)
      if (this.filterUpbjj && this.filterKategori) {
        hasil = hasil.filter(s => s.kategori === this.filterKategori);
      }

      // Filter re-order (qty < safety ATAU qty == 0)
      if (this.filterReorder) {
        hasil = hasil.filter(s => s.qty < s.safety || s.qty === 0);
      }

      // Sort
      if (this.sortBy) {
        hasil = [...hasil].sort((a, b) => {
          let valA = a[this.sortBy];
          let valB = b[this.sortBy];
          if (typeof valA === 'string') valA = valA.toLowerCase();
          if (typeof valB === 'string') valB = valB.toLowerCase();
          if (valA < valB) return this.sortDir === 'asc' ? -1 : 1;
          if (valA > valB) return this.sortDir === 'asc' ? 1 : -1;
          return 0;
        });
      }

      return hasil;
    },

    /** Statistik ringkasan */
    totalStok()    { return this.stok.reduce((s, i) => s + i.qty, 0); },
    jumlahKosong() { return this.stok.filter(s => s.qty === 0).length; },
    jumlahMenipis(){ return this.stok.filter(s => s.qty > 0 && s.qty < s.safety).length; },
    jumlahAman()   { return this.stok.filter(s => s.qty >= s.safety).length; },
    totalNilaiStok(){ return this.stok.reduce((s, i) => s + (i.qty * i.harga), 0); },

    /** Label sort aktif untuk tampilan */
    sortLabel() {
      const labels = { judul: 'Judul', qty: 'Stok', harga: 'Harga' };
      return this.sortBy ? `${labels[this.sortBy]} (${this.sortDir === 'asc' ? '↑' : '↓'})` : 'Urutkan';
    },

    /** Apakah ada filter aktif? */
    hasActiveFilter() {
      return this.filterUpbjj || this.filterKategori || this.filterReorder || this.sortBy;
    }
  },

  // ============================================
  // WATCHERS
  // ============================================
  watch: {
    /**
     * Watcher 1: Pantau perubahan filterUpbjj.
     * Reset filterKategori saat UT-daerah berubah (dependent options logic).
     */
    filterUpbjj(newVal, oldVal) {
      this.filterKategori = '';
      this.lastFilterUpbjj = oldVal || '';
      if (newVal) {
        const count = this.stok.filter(s => s.upbjj === newVal).length;
        this.showToast(`📍 Menampilkan ${count} bahan ajar di UPBJJ ${newVal}`, 'info');
      }
    },

    /**
     * Watcher 2: Pantau perubahan data stok.
     * Hitung ulang jumlah item yang perlu re-order dan tampilkan notifikasi.
     */
    stok: {
      deep: true,
      handler(newVal) {
        const reorder = newVal.filter(s => s.qty < s.safety || s.qty === 0).length;
        if (reorder !== this.reorderCount) {
          this.reorderCount = reorder;
          if (reorder > 0) {
            this.showToast(`⚠️ ${reorder} bahan ajar memerlukan re-order!`, 'warning');
          }
        }
      }
    },

    /**
     * Watcher 3: Pantau filterReorder.
     * Beri notifikasi jumlah item saat filter re-order diaktifkan.
     */
    filterReorder(val) {
      if (val) {
        const n = this.stok.filter(s => s.qty < s.safety || s.qty === 0).length;
        this.showToast(`🔔 Ditemukan ${n} item perlu re-order`, 'warning');
      }
    },

    /**
     * Watcher 4: Pantau sortBy.
     * Beri notifikasi saat urutan berubah.
     */
    sortBy(val) {
      if (val) {
        const labels = { judul: 'Judul', qty: 'Jumlah Stok', harga: 'Harga' };
        this.showToast(`↕️ Diurutkan berdasarkan ${labels[val]}`, 'info');
      }
    }
  },

  // ============================================
  // METHODS
  // ============================================
  methods: {
    // ── Auth ─────────────────────────────────
    initAuth() {
      const raw = sessionStorage.getItem('user');
      if (!raw) { window.location.href = 'index.html'; return; }
      this.currentUser = JSON.parse(raw);

      // Hitung reorder awal
      this.reorderCount = this.stok.filter(s => s.qty < s.safety || s.qty === 0).length;
    },

    doLogout() {
      if (confirm('Keluar dari SITTA?')) {
        sessionStorage.removeItem('user');
        window.location.href = 'index.html';
      }
    },

    getInitial(nama) {
      return (nama || 'U')[0].toUpperCase();
    },

    // ── Format ───────────────────────────────
    formatRupiah(num) {
      return 'Rp ' + Number(num).toLocaleString('id-ID');
    },

    // ── Status stok ──────────────────────────
    statusStok(item) {
      if (item.qty === 0)             return { label: 'Kosong',  kelas: 'badge-danger',  icon: '🔴' };
      if (item.qty < item.safety)     return { label: 'Menipis', kelas: 'badge-warning', icon: '🟡' };
      return                                 { label: 'Aman',    kelas: 'badge-success', icon: '🟢' };
    },

    statusKelas(item) {
      if (item.qty === 0)         return 'stok-kosong';
      if (item.qty < item.safety) return 'stok-menipis';
      return 'stok-aman';
    },

    // ── Sort ─────────────────────────────────
    toggleSort(field) {
      if (this.sortBy === field) {
        this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortBy = field;
        this.sortDir = 'asc';
      }
    },

    sortIcon(field) {
      if (this.sortBy !== field) return '↕️';
      return this.sortDir === 'asc' ? '↑' : '↓';
    },

    // ── Reset filter ─────────────────────────
    resetFilter() {
      this.filterUpbjj   = '';
      this.filterKategori = '';
      this.filterReorder  = false;
      this.sortBy         = '';
      this.sortDir        = 'asc';
      this.showToast('🔄 Filter berhasil direset', 'success');
    },

    // ── Form Tambah ──────────────────────────
    bukaFormTambah() {
      this.showFormTambah = true;
      this.formTambah = { kode:'', judul:'', kategori:'', upbjj:'', lokasiRak:'', harga:'', qty:'', safety:'', catatanHTML:'' };
      this.errTambah   = {};
      this.alertTambah = '';
    },

    tutupFormTambah() {
      this.showFormTambah = false;
    },

    validasiFormTambah() {
      const e = {};
      const f = this.formTambah;
      if (!f.kode.trim())     e.kode     = 'Kode MK wajib diisi';
      if (!f.judul.trim())    e.judul    = 'Judul wajib diisi';
      if (!f.kategori)        e.kategori = 'Pilih kategori';
      if (!f.upbjj)           e.upbjj    = 'Pilih UT-Daerah';
      if (!f.lokasiRak.trim())e.lokasiRak= 'Lokasi rak wajib diisi';
      if (!f.harga || isNaN(f.harga) || Number(f.harga) <= 0)
                              e.harga    = 'Harga harus angka > 0';
      if (f.qty === '' || isNaN(f.qty) || Number(f.qty) < 0)
                              e.qty      = 'Stok harus angka ≥ 0';
      if (f.safety === '' || isNaN(f.safety) || Number(f.safety) < 0)
                              e.safety   = 'Safety stock harus angka ≥ 0';

      // Cek kode duplikat
      if (!e.kode && this.stok.find(s => s.kode === f.kode.trim().toUpperCase())) {
        e.kode = 'Kode MK sudah terdaftar';
      }
      this.errTambah = e;
      return Object.keys(e).length === 0;
    },

    simpanTambah() {
      if (!this.validasiFormTambah()) return;
      const f = this.formTambah;
      this.stok.push({
        kode:       f.kode.trim().toUpperCase(),
        judul:      f.judul.trim(),
        kategori:   f.kategori,
        upbjj:      f.upbjj,
        lokasiRak:  f.lokasiRak.trim(),
        harga:      Number(f.harga),
        qty:        Number(f.qty),
        safety:     Number(f.safety),
        catatanHTML: f.catatanHTML.trim()
      });
      this.showFormTambah = false;
      this.showToast('✅ Bahan ajar berhasil ditambahkan!', 'success');
    },

    // ── Modal Edit ───────────────────────────
    bukaEdit(item) {
      this.formEdit = { ...item }; // shallow copy
      this.errEdit   = {};
      this.alertEdit = '';
      this.showModalEdit = true;
    },

    tutupEdit() {
      this.showModalEdit = false;
    },

    validasiFormEdit() {
      const e = {};
      const f = this.formEdit;
      if (!f.judul.trim())    e.judul    = 'Judul wajib diisi';
      if (!f.kategori)        e.kategori = 'Pilih kategori';
      if (!f.upbjj)           e.upbjj    = 'Pilih UT-Daerah';
      if (!f.lokasiRak.trim())e.lokasiRak= 'Lokasi rak wajib diisi';
      if (!f.harga || isNaN(f.harga) || Number(f.harga) <= 0)
                              e.harga    = 'Harga harus angka > 0';
      if (f.qty === '' || isNaN(f.qty) || Number(f.qty) < 0)
                              e.qty      = 'Stok harus angka ≥ 0';
      if (f.safety === '' || isNaN(f.safety) || Number(f.safety) < 0)
                              e.safety   = 'Safety stock harus angka ≥ 0';
      this.errEdit = e;
      return Object.keys(e).length === 0;
    },

    simpanEdit() {
      if (!this.validasiFormEdit()) return;
      const idx = this.stok.findIndex(s => s.kode === this.formEdit.kode);
      if (idx !== -1) {
        // Vue reactivity: gunakan Vue.set atau splice agar array reactive
        Vue.set(this.stok, idx, {
          ...this.formEdit,
          harga:  Number(this.formEdit.harga),
          qty:    Number(this.formEdit.qty),
          safety: Number(this.formEdit.safety)
        });
      }
      this.showModalEdit = false;
      this.showToast('✏️ Data bahan ajar berhasil diperbarui!', 'success');
    },

    hapusStok(kode) {
      if (!confirm('Hapus bahan ajar ini?')) return;
      const idx = this.stok.findIndex(s => s.kode === kode);
      if (idx !== -1) {
        this.stok.splice(idx, 1);
        this.showToast('🗑️ Bahan ajar berhasil dihapus', 'warning');
      }
    },

    // ── Toast Notification ───────────────────
    showToast(msg, type = 'success') {
      this.toast = { show: true, msg, type };
      setTimeout(() => { this.toast.show = false; }, 3200);
    }
  },

  // ============================================
  // LIFECYCLE
  // ============================================
  mounted() {
    this.initAuth();
  }
});
